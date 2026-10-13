import { useState } from 'react'
import { Check, Plus, Search, Settings as Cog, Star, FolderGit2, AtSign, Users, Activity } from 'lucide-react'
import '../apps.css'
import { useStore } from '../store'
import { Modal } from './ui'
import { CATALOG, CATS, type CatItem } from '../catalog'
import { t } from '../i18n'

function Row({ it, on, open, setOpen }: { it: CatItem; on: boolean; open: boolean; setOpen: (v: boolean) => void }) {
  const { rpc, say } = useStore()
  const [vals, setVals] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const need = it.fields ?? []
  const ready = need.every((f) => (vals[f.key] ?? '').trim())

  const add = async () => {
    setBusy(true)
    const args = [...(it.args ?? []), ...need.filter((f) => f.kind === 'arg').map((f) => '"' + vals[f.key].trim() + '"')].join(' ')
    const env = need.filter((f) => f.kind === 'env').map((f) => f.key + '=' + vals[f.key].trim()).join('\n')
    const r = await rpc<{ id: string }>('saveMcp', { name: it.id, type: it.type, command: it.command, args, url: it.url, env })
    if (r) await rpc('saveMcp', { id: r.id, allBots: true }) // disponible para todos los bots desde el primer momento
    setBusy(false)
    if (r) { setOpen(false); say(t('Подключено: {n}', { n: it.name })) }
  }
  const remove = async () => {
    const s = useStore.getState().tools.mcp.find((x) => x.name === it.id)
    if (s) await rpc('deleteMcp', { id: s.id })
  }
  const click = () => (on ? void remove() : need.length ? setOpen(!open) : void add())

  return (
    <div className={'app-row' + (open ? ' open' : '')}>
      <div className="app-line">
        <span className="app-ico">{it.name[0]}</span>
        <div className="app-main"><b>{it.name}</b><div className="sub">{t(it.desc)}</div></div>
        <button className={'btn small' + (on ? ' on' : '')} disabled={busy} onClick={click}>
          {on ? <><Check size={14} /> {t('Подключено')}</> : <><Plus size={14} /> {t('Добавить')}</>}
        </button>
      </div>
      {open && !on && (
        <div className="app-form">
          {need.map((f) => (
            <div key={f.key}>
              <label>{t(f.label)}</label>
              <input autoFocus={f === need[0]} type={f.kind === 'env' ? 'password' : 'text'} value={vals[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
            </div>
          ))}
          <div className="modal-foot"><button className="btn primary" disabled={!ready || busy} onClick={add}>{t('Подключить')}</button></div>
        </div>
      )}
    </div>
  )
}

export default function Apps() {
  const { setModal, tools, setPanel } = useStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')
  const [open, setOpen] = useState('')
  const has = (id: string) => tools.mcp.some((s) => s.name === id)
  const shown = CATALOG.filter((i) => (cat === 'all' || i.cat === cat) && (!q.trim() || (i.name + ' ' + i.desc).toLowerCase().includes(q.trim().toLowerCase()) || t(i.desc).toLowerCase().includes(q.trim().toLowerCase())))
  const rec = !q.trim() && cat === 'all' ? shown.filter((i) => i.rec) : []
  const rest = shown.filter((i) => !rec.includes(i))
  const n = CATALOG.filter((i) => has(i.id)).length + tools.mcp.filter((s) => !CATALOG.some((i) => i.id === s.name)).length

  return (
    <Modal title={t('Подключить приложения')} onClose={() => setModal(null)} wide>
      <div className="apps-sub sub">{n > 0 ? t('Подключено: {n}', { n }) : t('Дайте ботам новые инструменты')}</div>
      <div className="apps-quick">
        <button className="btn-pill sm" onClick={() => { setModal(null); setPanel({ kind: 'workspace' }) }}><FolderGit2 size={16} /> {t('Воркспейс')}</button>
        <button className="btn-pill sm" onClick={() => setModal('accounts')}><AtSign size={16} /> {t('Аккаунты')}</button>
        <button className="btn-pill sm" onClick={() => setModal('createGroup')}><Users size={16} /> {t('+ Группа')}</button>
        <button className="btn-pill sm" onClick={() => setModal('status')}><Activity size={16} /> {t('Estado')}</button>
      </div>
      <div className="apps-search"><Search size={15} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Поиск приложений')} /></div>
      <div className="apps-chips">
        {CATS.map((c) => <button key={c.id} className={'chip' + (cat === c.id ? ' on' : '')} onClick={() => setCat(c.id)}>{t(c.label)}</button>)}
      </div>
      <div className="apps-list">
        {rec.length > 0 && <h3><Star size={12} /> {t('Рекомендуем')}</h3>}
        {rec.map((i) => <Row key={i.id} it={i} on={has(i.id)} open={open === i.id} setOpen={(v) => setOpen(v ? i.id : '')} />)}
        {rec.length > 0 && rest.length > 0 && <h3>{t('Все приложения')}</h3>}
        {rest.map((i) => <Row key={i.id} it={i} on={has(i.id)} open={open === i.id} setOpen={(v) => setOpen(v ? i.id : '')} />)}
        {shown.length === 0 && <div className="sub apps-none">{t('Ничего не найдено.')}</div>}
      </div>
      <button className="btn wide-btn" onClick={() => setModal('tools')}><Cog size={15} /> {t('Свой сервер, навыки и импорт')}</button>
    </Modal>
  )
}
