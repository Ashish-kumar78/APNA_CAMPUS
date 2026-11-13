import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AccessibilityProvider } from './context/AccessibilityContext.jsx'
import { FontScaleProvider } from './context/FontScaleContext.jsx'
import { initTheme } from './services/themeStore.js'
import { initLanguage } from './services/languageStore.js'

// Initialize user's preferred theme and language immediately on app startup
try {
  initTheme()
  initLanguage()
} catch (e) {
  console.warn('Failed to pre-init theme or language:', e)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AccessibilityProvider>
        <FontScaleProvider>
          <App />
        </FontScaleProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  </StrictMode>,
)
