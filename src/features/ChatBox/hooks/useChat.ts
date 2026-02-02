import { useState, useRef, useEffect } from 'react'
import apiClient, { createStreamingRequest } from '~/lib/apiClient'
import { endPoints } from '~/lib/endPoints'
import { MessageStatus, type Message } from '../types/chatTypes'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

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
            // Cùng ngày → reuse id cũ
            convId = parsed.id
          } else {
            // Ngày mới → tạo id mới
            localStorage.removeItem('dailyConversation')
          }
        } catch (e) {
          console.error('Error parsing daily conversation', e)
          localStorage.removeItem('dailyConversation')
        }
      }

      // Tạo id mới nếu chưa có
      if (!convId) {
        convId = `conv-${Date.now()}`
        localStorage.setItem('dailyConversation', JSON.stringify({ date: today, id: convId }))
      }

      setConversationId(convId)

      // Fetch messages từ API
      try {
        const res = await apiClient.get(endPoints.chat.getChatHistory, {
          params: { conversationId: convId }
        })
        const chatMessages = res?.data?.data || []
        setMessages(chatMessages)
      } catch (err) {
        console.error('Failed to load messages:', err)
        setMessages([])
      }
    }

    initConversation()
  }, [])

  // Lưu conversationId vào localStorage khi thay đổi
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

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim() || !conversationId) return

    const userMessage: Message = {
      conversationId,
      message: userInput,
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

      const response = await createStreamingRequest(endPoints.chat.sendMessage, {
        conversationId,
        userMessage
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No response body')

      let fullResponse = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullResponse += chunk

        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.isAI) {
            last.message = fullResponse
            last.updated_at = new Date()
          }
          return updated
        })
      }

      // DONE - NORMAL CASE
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.isAI) {
          last.status = MessageStatus.DONE
          last.updated_at = new Date()
        }
        return updated
      })

      setIsLoading(false)
    } catch {
      // ERROR CASE
      const errorMessage = 'Hệ thống không nhận được câu trả lời, hãy liên hệ cố vấn kĩ thuật'

      // Reset AI message để typing error
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
          // DONE typing error
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
