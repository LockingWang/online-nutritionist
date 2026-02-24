import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './index.css'
import App from './App'

// 開發模式或設定 VITE_VCONSOLE=true 時啟用 vConsole，方便在手機上查看 console / 網路 / 錯誤
if (import.meta.env.DEV || import.meta.env.VITE_VCONSOLE === 'true') {
  import('vconsole').then(({ default: VConsole }) => {
    new VConsole()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
