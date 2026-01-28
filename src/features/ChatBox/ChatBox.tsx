import { useState, useRef, useEffect } from 'react'
import { createStreamingRequest } from '~/lib/apiClient'
import { endPoints } from '~/lib/endPoints'
import type { Message } from './types/chatTypes'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // === INIT: Load/create daily conversationId + messages + cleanup old data ===
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'

    let convId = ''
    let initialMessages: Message[] = []

    const storedDaily = localStorage.getItem('dailyConversation')
    if (storedDaily) {
      try {
        const parsed = JSON.parse(storedDaily)
        if (parsed.date === today && parsed.id) {
          // Cùng ngày → reuse id cũ + load messages
          convId = parsed.id
          const storedMsgs = localStorage.getItem(`messages-${convId}`)
          if (storedMsgs) {
            initialMessages = JSON.parse(storedMsgs)
          }
        } else {
          // Ngày mới → cleanup messages của id cũ
          if (parsed.id) {
            localStorage.removeItem(`messages-${parsed.id}`)
          }
          localStorage.removeItem('dailyConversation')
        }
      } catch (e) {
        console.error('Error parsing daily conversation', e)
        localStorage.removeItem('dailyConversation')
      }
    }

    // Tạo id mới nếu chưa có (ngày mới hoặc lần đầu)
    if (!convId) {
      convId = `conv-${Date.now()}`
      localStorage.setItem('dailyConversation', JSON.stringify({ date: today, id: convId }))
    }

    setConversationId(convId)
    setMessages(initialMessages)
  }, [])

  // === Persist messages mỗi khi thay đổi ===
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(`messages-${conversationId}`, JSON.stringify(messages))
    }
  }, [messages, conversationId])

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
      status: 'PENDING',
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
        status: 'IN_PROGRESS',
        created_at: new Date(),
        updated_at: new Date(),
        isAI: true
      }

      setMessages((prev) => [...prev, aiMessage])

      const response = await createStreamingRequest(endPoints.chat.sendMessage, {
        conversationId,
        userMessage: userInput
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
          last.status = 'COMPLETED'
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
          last.status = 'IN_PROGRESS'
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
              last.status = 'ERROR'
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
