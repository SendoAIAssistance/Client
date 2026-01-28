import { useState, useRef, useEffect } from 'react'
import { createStreamingRequest } from '~/lib/apiClient'
import { endPoints } from '~/lib/endPoints'
import type { Message } from '../types/chatTypes'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // === INIT: Load/create daily conversationId + messages + cleanup old data ===
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0] // '2026-01-28'

    let convId = ''
    let initialMessages: Message[] = []

    // Kiểm tra có dữ liệu daily cũ không
    const storedDaily = localStorage.getItem('dailyConversation')
    if (storedDaily) {
      try {
        const parsed = JSON.parse(storedDaily)
        if (parsed.date === today && parsed.id) {
          // Cùng ngày → reuse id + load messages cũ
          convId = parsed.id
          const storedMsgs = localStorage.getItem(`messages-${convId}`)
          if (storedMsgs) {
            initialMessages = JSON.parse(storedMsgs)
          }
        } else {
          // Ngày mới → cleanup messages của id cũ trước khi tạo mới
          if (parsed.id) {
            localStorage.removeItem(`messages-${parsed.id}`)
          }
          // Xóa luôn key daily cũ (sẽ overwrite ngay sau)
          localStorage.removeItem('dailyConversation')
        }
      } catch (e) {
        console.error('Error parsing daily conversation', e)
        localStorage.removeItem('dailyConversation')
      }
    }

    // Nếu chưa có id (ngày mới hoặc lần đầu) → tạo mới
    if (!convId) {
      convId = `conv-${Date.now()}` // vẫn unique để tránh conflict nếu cần
      localStorage.setItem('dailyConversation', JSON.stringify({ date: today, id: convId }))
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConversationId(convId)
    setMessages(initialMessages)
  }, [])

  // === Persist messages mới mỗi khi thay đổi ===
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(`messages-${conversationId}`, JSON.stringify(messages))
    }
  }, [messages, conversationId])

  // Auto scroll
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

    // Phần try/catch + streaming giữ nguyên như version trước mình đã sửa (không finally hacky)
    // ... (copy phần sendMessage đã sửa ở tin nhắn trước)
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
