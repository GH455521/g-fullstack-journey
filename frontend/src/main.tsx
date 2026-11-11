// `StrictMode` 是「**严苛模式**」——开发时会**故意**让组件渲染两次帮你发现副作用 bug，生产环境不会。
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// 其中 ! 是 TypeScript 的非空断言，告诉 TypeScript：我们确定页面中存在 root 元素。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
