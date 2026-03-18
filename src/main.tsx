import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import '@/lib/cognito'

async function enableMocking() {
  if (import.meta.env.VITE_MOCK !== 'true') return
  const { worker } = await import('./mocks/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

// Cache buster for v2 transition
if (!localStorage.getItem('claimiq_v2_onboarding')) {
  localStorage.removeItem('claimiq-auth')
  localStorage.setItem('claimiq_v2_onboarding', 'true')
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
