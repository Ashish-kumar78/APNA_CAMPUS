import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AccessibilityProvider } from './context/AccessibilityContext.jsx'
import { FontScaleProvider } from './context/FontScaleContext.jsx'

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
