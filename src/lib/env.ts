export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  googleAuthorizedRedirectUri: import.meta.env.VITE_GOOGLE_AUTHORIZED_REDIRECT_URI || ''
}
