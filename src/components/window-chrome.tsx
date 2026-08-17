import { getCurrentWindow } from '@tauri-apps/api/window'
import { Copy, Minus, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '../store/modules/setting'

const appWindow = getCurrentWindow()

/**
 * 无边框窗口的隐形窗控件层，悬浮于内嵌 dsh 页面之上（页面铺满整个窗口）。
 *
 * 布局（依据 dsh 页面实测 DOM 几何）：
 * - 顶部 12px 全宽透明拖拽条：左段（dsh 侧边栏顶部控件 x<270px）
 *   pointer-events-none 点击穿透，其余区段 data-tauri-drag-region="deep"
 *   可拖动窗口、双击最大化/还原。12px 故意压到 dsh 顶部按钮（y≈12 起）之上，
 *   仅占其上方空白，不遮挡按钮。
 * - 窗控按钮组（最小化/最大化/关闭）放在右上角 y=44 起，故意低于 dsh
 *   顶部按钮带（新建会话/收起侧边栏/Session log 等，y≈12-44），二者不重叠。
 *   平时透明隐形，hover 才显形。
 *
 * z-40 高于调试抽屉（z-30）：抽屉顶部 12px 被拖拽条覆盖无交互损失，
 * 窗控按钮悬于抽屉右上角之上始终可达。
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
    <>
      {/* 顶部 12px 全宽透明拖拽条 */}
      <div className="absolute inset-x-0 top-0 z-40 flex h-3 select-none">
        {/* dsh 侧边栏顶部控件区（新建会话/收起侧边栏等 x<270px）：点击穿透给 iframe */}
        <div className="pointer-events-none w-72 shrink-0" />
        {/* 主内容区顶带：隐形拖拽区 */}
        <div data-tauri-drag-region="deep" className="min-w-0 flex-1" />
      </div>
      {/* 右上角窗控按钮组：y=44 起，低于 dsh 顶部按钮带（y≈12-44），不重叠 */}
      <div className="absolute right-0 top-11 z-40 flex select-none items-stretch">
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
    </>
  )
}
