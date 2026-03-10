export const endPoints = {
  chat: {
    getChatHistory: '/api/chat',
    sendMessage: '/api/chat/message',
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
    getResults: '/api/ai/results',
    sendMessage: '/api/v1/chat'
  }
}
