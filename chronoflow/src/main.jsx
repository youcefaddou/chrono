import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './lib/i18n'
import App from './App.jsx'
import { GlobalTimerProvider } from './components/Timer/GlobalTimerProvider'
import { ThemeProvider } from './context/theme-context'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <GlobalTimerProvider>
          <App />
        </GlobalTimerProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
