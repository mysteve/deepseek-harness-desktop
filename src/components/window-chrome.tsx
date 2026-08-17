import { getCurrentWindow } from '@tauri-apps/api/window'
import { Copy, Minus, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '../store/modules/setting'

const appWindow = getCurrentWindow()

/**
 * 无边框窗口的隐形窗控件层，悬浮于内嵌 dsh 页面之上（页面铺满整个窗口）：
 * - 顶部 32px 全宽透明条：左段（dsh 侧边栏区，实测其顶部控件 x < 270px）
 *   pointer-events-none 点击穿透，侧边栏按钮不受影响；其余区段
 *   data-tauri-drag-region="deep"，按住可拖动窗口、双击最大化/还原。
 * - 右上角最小化/最大化/关闭按钮：平时透明隐形，hover 才显形。
 * - Tauri 注入的 drag 脚本对 BUTTON 等可点元素自动放行，按钮与拖拽区共存。
 * - z-40 高于调试抽屉（z-30）：抽屉顶部 32px 为 padding/标题无交互，
 *   被隐形拖拽条覆盖无副作用，抽屉展开时窗控依然可达、窗口依然可拖。
 */
export default function WindowChrome() {
  const { t } = useI18n()
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    let disposed = false
    async function sync() {
      const next = await appWindow.isMaximized()
      if (!disposed)
        setMaximized(next)
    }
    sync()
    const unlisten = appWindow.onResized(sync)
    return () => {
      disposed = true
      unlisten.then(fn => fn())
    }
  }, [])

  return (
    <div className="absolute inset-x-0 top-0 z-40 flex h-8 select-none">
      {/* dsh 侧边栏顶部控件区（新建会话/收起侧边栏等）：点击穿透给 iframe */}
      <div className="pointer-events-none w-72 shrink-0" />
      {/* 主内容区顶带（实测始终无可点元素）：隐形拖拽区 */}
      <div data-tauri-drag-region="deep" className="min-w-0 flex-1" />
      <div className="flex h-full shrink-0 items-stretch">
        <button
          type="button"
          title={t('titlebar.minimize')}
          onClick={() => appWindow.minimize()}
          className="flex w-11 items-center justify-center text-muted transition-colors hover:bg-panel-hover hover:text-ink"
        >
          <Minus className="size-4" />
        </button>
        <button
          type="button"
          title={maximized ? t('titlebar.restore') : t('titlebar.maximize')}
          onClick={() => appWindow.toggleMaximize()}
          className="flex w-11 items-center justify-center text-muted transition-colors hover:bg-panel-hover hover:text-ink"
        >
          {maximized ? <Copy className="size-3.5" /> : <Square className="size-3.5" />}
        </button>
        <button
          type="button"
          title={t('titlebar.close')}
          onClick={() => appWindow.close()}
          className="flex w-11 items-center justify-center text-muted transition-colors hover:bg-danger hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
