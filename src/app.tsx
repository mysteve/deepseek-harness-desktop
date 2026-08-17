import { useEffect } from 'react'
import { useStore } from 'valtio-define'
import DebugSidebar from './components/debug-sidebar'
import DownloadToast from './components/download-toast'
import HarnessUpdater from './components/harness-updater'
import HarnessWebview from './components/harness-webview'
import SidebarToggle from './components/sidebar-toggle'
import WindowChrome from './components/window-chrome'
import { useDshTheme } from './hooks/use-dsh-theme'
import { store } from './store'

/**
 * 应用根组件：只负责首次启动与整体布局。
 * 业务状态与操作方法全部收敛到 valtio-define store，
 * 各子组件自行订阅 store，不再通过 props 透传回调与状态。
 */
export default function App() {
  useDshTheme()
  const { status } = useStore(store.harness)

  // 首次挂载自动启动 harness（store 内部对 StrictMode 重复挂载去重）
  useEffect(() => {
    store.harness.startup()
  }, [])

  // 安装/启动过程中不展示侧边栏；就绪与错误态才展示
  const showSidebar = status === 'ready' || status === 'error'

  return (
    // dsh 页面铺满整个窗口（顶到边）；窗口拖拽与窗控按钮由
    // WindowChrome 以隐形悬浮层提供，视觉上与页面融为一体
    <div className="relative flex h-screen w-screen flex-col overflow-hidden">
      <HarnessWebview />
      {status === 'ready' && <HarnessUpdater />}
      {status === 'ready' && <DownloadToast />}
      {showSidebar && <SidebarToggle />}
      {showSidebar && <DebugSidebar />}
      <WindowChrome />
    </div>
  )
}
