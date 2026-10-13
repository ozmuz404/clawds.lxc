import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useStore } from '../store'
import { Modal, Avatar } from './ui'
import { modelName } from '../models'
import { t } from '../i18n'

type Health = {
  at: number
  providers: { id: string; name: string; baseUrl: string; ok: boolean; ms: number; error?: string }[]
  claude: { loggedIn: boolean }
  mcp: { name: string; type: string; allBots: boolean }[]
  bots: { id: string; name: string; model: string; fallback: string; sleeping: boolean; runsToday: number; lastError: string; lastErrorAt: number }[]
}

const Dot = ({ ok }: { ok: boolean }) => <span className={'st-dot ' + (ok ? 'ok' : 'bad')} />

// Pantalla de estado: endpoints de modelos, sesión de Claude, MCP y último error de cada bot
export default function Status() {
  const { rpc, setModal } = useStore()
  const [h, setH] = useState<Health | null>(null)
  const [busy, setBusy] = useState(false)
  const load = async () => { setBusy(true); const r = await rpc<Health>('healthCheck'); if (r) setH(r); setBusy(false) }
  useEffect(() => { void load() }, [])
  const ago = (ts: number) => { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? t('hace un momento') : m < 60 ? `${m} min` : `${Math.round(m / 60)} h` }

  return (
    <Modal title={t('Estado')} onClose={() => setModal(null)} wide>
      <div className="st-top">
        <span className="sub">{h ? t('Revisado {n}', { n: ago(h.at) }) : t('Revisando…')}</span>
        <button className="btn small" disabled={busy} onClick={load}><RefreshCw size={14} /> {t('Actualizar')}</button>
      </div>
      {h && (
        <>
          <div className="section-label">{t('Modelos y endpoints')}</div>
          <div className="st-row"><Dot ok={h.claude.loggedIn} /><div className="grow"><b>Claude</b><div className="sub">{h.claude.loggedIn ? t('Sesión iniciada') : t('Sin sesión (solo sirven los endpoints propios)')}</div></div></div>
          {h.providers.map((p) => (
            <div className="st-row" key={p.id}>
              <Dot ok={p.ok} />
              <div className="grow"><b>{p.name}</b><div className="sub st-mono">{p.baseUrl}</div></div>
              <span className={'st-chip' + (p.ok ? '' : ' bad')}>{p.ok ? `${p.ms} ms` : p.error}</span>
            </div>
          ))}
          <div className="section-label">{t('Herramientas (MCP)')}</div>
          {h.mcp.length === 0 && <div className="sub">{t('Ninguna conectada')}</div>}
          {h.mcp.map((m) => <div className="st-row" key={m.name}><Dot ok /><div className="grow"><b>{m.name}</b></div><span className="st-chip">{m.allBots ? t('todos los bots') : m.type}</span></div>)}
          <div className="section-label">{t('Bots')}</div>
          {h.bots.map((b) => (
            <div className="st-row" key={b.id}>
              <Avatar id={b.id} size={28} />
              <div className="grow">
                <b>{b.name}</b>
                <div className="sub">{modelName(b.model)}{b.fallback ? ` → ${modelName(b.fallback)}` : ' · ' + t('sin respaldo')} · {t('hoy:')} {b.runsToday}</div>
                {b.lastError && <div className="st-err">{b.lastError}{b.lastErrorAt ? ` · ${ago(b.lastErrorAt)}` : ''}</div>}
              </div>
              <Dot ok={!b.lastError} />
            </div>
          ))}
        </>
      )}
    </Modal>
  )
}
