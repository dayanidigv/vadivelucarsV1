import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { queryClient } from './lib/query-client'
import App from './App'
import './index.css'

import { GoogleOAuthProvider } from '@react-oauth/google'

// Get Client ID from env or use a placeholder to prevent crash during dev
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId={googleClientId}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>,
)
