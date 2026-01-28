import { useState, useRef, useEffect } from 'react'
import { type Message } from '~/ChatBox/types/chatTypes'
import { createStreamingRequest } from '~/lib/apiClient'
import { endPoints } from '~/lib/endPoints'

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

      // Sử dụng createStreamingRequest từ apiClient
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
    } catch {
      // Stream error message với hiệu ứng typing
      const errorMessage = 'Hệ thống không nhận được câu trả lời, hãy liên hệ cố vấn kĩ thuật'

      // Đảm bảo message đã được tạo và reset về IN_PROGRESS để hiển thị typing
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.isAI) {
          last.status = 'IN_PROGRESS'
          last.message = ''
        }
        return updated
      })

      // Stream error message từng ký tự
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

          // Tiếp tục stream với delay nhỏ để tạo hiệu ứng typing
          setTimeout(streamError, 30) // 30ms delay giữa mỗi ký tự
        } else {
          // Hoàn thành streaming, set status thành ERROR
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

      // Bắt đầu stream sau một chút delay
      setTimeout(streamError, 100)
      // Không set isLoading = false ở đây, sẽ set sau khi stream xong
      return
    } finally {
      // Chỉ set loading = false nếu không phải error case (error sẽ tự set sau khi stream xong)
      // Delay một chút để đảm bảo error case đã được setup
      setTimeout(() => {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          // Nếu không phải error case hoặc đã stream xong, set loading = false
          if (!last?.isAI || last.status !== 'IN_PROGRESS' || last.message.length > 0) {
            setIsLoading(false)
          }
          return prev
        })
      }, 200)
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
