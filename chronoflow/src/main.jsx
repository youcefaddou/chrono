import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './lib/i18n'
import App from './App.jsx'
import { GlobalTimerProvider } from './components/Timer/GlobalTimerProvider'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalTimerProvider>
        <App />
      </GlobalTimerProvider>
    </BrowserRouter>
  </StrictMode>,
)
