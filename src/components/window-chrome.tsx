import { getCurrentWindow } from '@tauri-apps/api/window'
import { Copy, Minus, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '../store/modules/setting'

const appWindow = getCurrentWindow()

/**
 * 无边框窗口的无痕标题条带，位于 iframe 之上（页面整体下移 36px）。
 *
 * 为什么是独立条带而非悬浮层：iframe 内 dsh 页面右侧从 y≈12 起层层布满
 * 可点按钮（Session log、复制、上下文注入等），悬浮在任何 y 都会遮挡其中
 * 某一层。独立条带把 iframe 完整下移到条带之下，iframe 可交互区 100% 无遮挡。
 *
 * 无痕处理：无应用名、无下边框、无背景（透明，直接透出 iframe 之上的窗口
 * 底色），整条 data-tauri-drag-region="deep" 可拖动、双击最大化/还原。
 * 右侧窗控按钮平时透明、hover 才显形。按钮是可点元素，与拖拽区共存无需特殊处理。
 *
 * z-40 高于调试抽屉（z-30）：抽屉展开时其顶部 36px 被条带覆盖（抽屉顶部为
 * padding/标题无交互，无副作用），窗控始终可达、窗口依然可拖。
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
    <header
      data-tauri-drag-region="deep"
      className="relative z-40 flex h-9 shrink-0 select-none items-stretch justify-end"
    >
      <div className="flex h-full items-stretch">
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
    </header>
  )
}
