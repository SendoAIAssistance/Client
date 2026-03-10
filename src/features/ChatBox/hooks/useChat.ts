import { useState, useRef, useEffect } from 'react'
import { endPoints } from '~/lib/endPoints'
import { MessageStatus, type Message } from '../types/chatTypes'
import { useStreaming } from './useStreaming'
import apiClient from '~/lib/apiClient'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const requestStartAtRef = useRef<number>(0)
  const { stream } = useStreaming({
    onChunkReceived: (response, thinking, eventType) => {
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (!last?.isAI) return updated

        if (eventType === 'thinking') {
          if (thinking) {
            last.thinking = thinking
          }
        } else {
          last.message = response
        }

        last.updated_at = new Date()
        return updated
      })
    }
  })

  // === INIT: Load/create daily conversationId + fetch messages from API ===
  useEffect(() => {
    const initConversation = async () => {
      const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'

      let convId = ''
      const storedDaily = localStorage.getItem('dailyConversation')

      if (storedDaily) {
        try {
          const parsed = JSON.parse(storedDaily)
          if (parsed.date === today && parsed.id) {
            // Same day → reuse old id
            convId = parsed.id
          } else {
            // New day → create new id
            localStorage.removeItem('dailyConversation')
          }
        } catch (e) {
          console.error('Error parsing daily conversation', e)
          localStorage.removeItem('dailyConversation')
        }
      }

      // Create new id if not exists
      if (!convId) {
        convId = `conv-${Date.now()}`
        localStorage.setItem('dailyConversation', JSON.stringify({ date: today, id: convId }))
      }

      setConversationId(convId)

      // Fetch messages from API
      try {
        //'/api/chat?conversationId=xxx'
        const res = await apiClient.get(endPoints.chat.getChatHistory, {
          params: { conversationId: convId }
        })
        const chatMessages = res?.data?.data || []
        setMessages(chatMessages)
      } catch (err) {
        console.error('Failed to load messages:', err)
        setMessages([])
      }
      setMessages([])
    }

    initConversation()
  }, [])

  // Save conversationId to localStorage when it changes
  useEffect(() => {
    if (conversationId) {
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem('dailyConversation', JSON.stringify({ date: today, id: conversationId }))
    }
  }, [conversationId])

  // === Auto scroll ===
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const sendMessage = async (userInput: string, files?: File[]): Promise<boolean> => {
    if ((!userInput.trim() && (!files || files.length === 0)) || !conversationId) return false

    const userMessage: Message = {
      conversationId,
      message: userInput,
      files: files,
      status: MessageStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date(),
      isAI: false
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const aiMessage: Message = {
        conversationId,
        message: '',
        status: MessageStatus.IN_PROGRESS,
        created_at: new Date(),
        updated_at: new Date(),
        isAI: true
      }

      setMessages((prev) => [...prev, aiMessage])

      const formData = new FormData()
      formData.append('conversationId', conversationId)
      formData.append('message', userInput)

      if (files && files.length > 0) {
        files.forEach((file, index) => {
          formData.append(`file_${index}`, file)
        })
        formData.append('fileCount', files.length.toString())
      }

      let finalResponse = ''
      let finalThinking = ''
      requestStartAtRef.current = performance.now()

      await Promise.all([
        stream(endPoints.ai.sendMessage, formData, (response, thinking) => {
          finalResponse = response
          finalThinking = thinking
        }),
        apiClient.post(endPoints.chat.sendMessage, formData)
      ])

      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.isAI) {
          if (finalThinking) {
            last.thinking = finalThinking
          }

          // Track end-to-end request time on client since backend doesn't return thinkingDuration.
          const duration = Math.max(0, Math.round(performance.now() - requestStartAtRef.current))
          if (duration > 0) {
            last.thinkingDuration = duration
          }
        }
        return updated
      })

      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.isAI) {
          last.message = finalResponse
          last.status = MessageStatus.DONE
          last.updated_at = new Date()
        }
        return updated
      })

      apiClient.post(endPoints.chat.sendMessage, messages[messages.length - 1])
      console.log(messages[messages.length - 1])

      setIsLoading(false)
      return true
    } catch (err) {
      console.log(err)
      const errorMessage = 'System did not receive a response. Please contact technical support.'

      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.isAI) {
          last.status = MessageStatus.IN_PROGRESS
          last.message = ''
        }
        return updated
      })

      let currentIndex = 0
      const streamError = () => {
        if (currentIndex < errorMessage.length) {
          const chunk = errorMessage.slice(0, currentIndex + 1)
          currentIndex++

          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last?.isAI) {
              last.message = chunk
              last.updated_at = new Date()
            }
            return updated
          })

          setTimeout(streamError, 30)
        } else {
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last?.isAI) {
              last.status = MessageStatus.ERROR
              last.updated_at = new Date()
            }
            return updated
          })
          setIsLoading(false)
        }
      }

      setTimeout(streamError, 100)
      return true
    }
  }

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    sendMessage,
    scrollRef,
    conversationId
  }
}
