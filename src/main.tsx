import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.less'
import './styles/rtl.css'
import './i18n'
import 'nprogress/nprogress.css'
import './styles/nprogress.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
