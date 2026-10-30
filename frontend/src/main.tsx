// `StrictMode` 是「**严苛模式**」——开发时会**故意**让组件渲染两次帮你发现副作用 bug，生产环境不会。
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
