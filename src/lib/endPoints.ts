export const endPoints = {
  chat: {
    getChatHistory: '/api/chat/history',
    sendMessage: '/api/chat/send-message',
    getMessage: '/api/chat/message'
  },
  auth: {
    logout: '/api/Auth/logout',
    me: '/users/me',
    refreshToken: '/api/Auth/refresh-token',
    login: '/api/Auth/login',
    register: '/api/Auth/register'
  },
  ai: {
    getAIModels: '/api/ai/models',
    getAISuggestions: '/api/ai/suggestions',
    getResults: '/api/ai/results'
  }
}
