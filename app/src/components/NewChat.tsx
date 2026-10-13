import { useState } from 'react'
import { Search, Star, UserPlus, Users } from 'lucide-react'
import '../apps.css'
import { useStore } from '../store'
import { Avatar, Modal } from './ui'
import { t } from '../i18n'

export default function NewChat() {
  const { bots, setModal, openDm } = useStore()
  const [q, setQ] = useState('')
  const list = [...bots].sort((a, b) => Number(b.boss) - Number(a.boss)).filter((b) => !q.trim() || (b.name + ' ' + b.role).toLowerCase().includes(q.trim().toLowerCase()))
  const go = async (id: string) => { setModal(null); await openDm(id) }
  return (
    <Modal title={t('Новый чат')} onClose={() => setModal(null)}>
      <div className="apps-search"><Search size={15} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Начать чат с…')} /></div>
      <div className="apps-list nc-list">
        <button className="app-row nc-row" onClick={() => setModal('createBot')}><span className="app-ico nc-ico"><UserPlus size={18} /></span><div className="app-main"><b>{t('Создать бота')}</b></div></button>
        <button className="app-row nc-row" onClick={() => setModal('createGroup')}><span className="app-ico nc-ico"><Users size={18} /></span><div className="app-main"><b>{t('Создать групповой чат')}</b></div></button>
        {list.length > 0 && <h3>{t('Боты')}</h3>}
        {list.map((b) => (
          <button key={b.id} className="app-row nc-row" onClick={() => go(b.id)}>
            <Avatar id={b.id} size={38} />
            <div className="app-main"><b>{b.name}{b.boss && <Star size={12} className="boss-star" fill="currentColor" />}</b><div className="sub">{b.role || t('бот')}</div></div>
          </button>
        ))}
      </div>
    </Modal>
  )
}
