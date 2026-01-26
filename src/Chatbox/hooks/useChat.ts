import { useState, useRef, useEffect } from 'react'
import { type Message } from '~/Chatbox/types/chatTypes'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId] = useState(() => `conv-${Date.now()}`)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim()) return

    const userMessage: Message = {
      conversationId,
      userMessage: userInput,
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
        userMessage: userInput,
        chatMessage: '',
        status: 'IN_PROGRESS',
        created_at: new Date(),
        updated_at: new Date(),
        isAI: true
      }

      setMessages((prev) => [...prev, aiMessage])

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userMessage: userInput })
      })

      if (!response.ok) throw new Error('Failed to get AI response')

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
            last.chatMessage = fullResponse
            last.updated_at = new Date()
          }
          return updated
        })
      }

      // Done streaming
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.isAI) {
          last.status = 'COMPLETED'
          last.updated_at = new Date()
        }
        return updated
      })
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.isAI) {
          last.chatMessage = 'Sorry, something went wrong. Please try again.'
          last.status = 'ERROR'
          last.updated_at = new Date()
        }
        return updated
      })
    } finally {
      setIsLoading(false)
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
