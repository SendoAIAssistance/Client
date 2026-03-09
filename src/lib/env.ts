export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  googleClientId: import.meta.env.VITE_OAUTH_CLIENT_ID || '',
  googleAuthorizedRedirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || '',
  streamingAiBaseUrl: import.meta.env.STREAMING_AI_BASE_URL || ''
}
