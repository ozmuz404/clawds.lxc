import { Plus, Search, Settings as Cog, FolderGit2, BellOff, Users, MessageSquare, Blocks } from 'lucide-react'
import { useStore } from '../store'
import { Avatar, authorName, fmtTime } from './ui'
import { t } from '../i18n'

export default function Sidebar() {
  const { channels, bots, messages, active, setActive, setModal, setPanel, typing, muted, live, unreadOf, running, stopAll, openDm } = useStore()

  const last = (cid: string) => { for (let i = messages.length - 1; i >= 0; i--) if (messages[i].channelId === cid && !messages[i].threadOf) return messages[i] }
  const rows = channels
    .map((c) => ({ c, m: last(c.id) }))
    .sort((a, b) => (b.m?.ts ?? 0) - (a.m?.ts ?? 0))

  const boss = bots.find((b) => b.boss)

  return (
    <aside className="sidebar">
      <div className="side-top">
        <button className="btn-circle" title={t('Поиск') + ' (Ctrl K)'} aria-label={t('Поиск')} onClick={() => setModal('search')}><Search /></button>
        <button className="btn-circle" title={t('Новый чат')} aria-label={t('Новый чат')} onClick={() => setModal('newChat')}><Plus /></button>
      </div>
      {boss && (
        <button className="boss-tile" onClick={() => void openDm(boss.id)} title={boss.name}>
          <span className="bot-tile"><Avatar id={boss.id} size={64} star /></span>
          <span className="boss-name">{boss.name}</span>
        </button>
      )}

      <div className="chatlist">
        {rows.length === 0 && <div className="side-empty">{t('Пока нет чатов. Нажмите + и создайте первого бота.')}</div>}
        {rows.map(({ c, m }) => {
          const member = c.members.includes('me')
          const peer = c.kind === 'dm' ? c.members.find((x) => x !== 'me') : undefined
          const bot = peer ? bots.find((b) => b.id === peer) : undefined
          const typers = typing[c.id] ?? []
          const unread = unreadOf(c.id)
          const isMuted = muted.includes(c.id)
          return (
            <button key={c.id} className={'chat-row' + (active === c.id ? ' sel' : '')} onClick={() => setActive(c.id)}>
              <Avatar id={bot ? bot.id : c.kind === 'dm' ? c.members[0] : c.id} size={40} />
              <div className="cr-main">
                <div className="cr-top">
                  <b>{c.kind === 'channel' ? '# ' : ''}{c.name}{isMuted && <BellOff size={12} className="muted-ico" />}</b>
                  <span className="cr-time">{m ? fmtTime(m.ts) : ''}</span>
                </div>
                <div className="cr-bottom">
                  {typers.length > 0 ? (
                    <span className="cr-typing">{typers.join(', ')} {t('печатает')}<i className="dots"><u /><u /><u /></i></span>
                  ) : (
                    <span className="cr-prev">
                      {!member && t('наблюдение') + ' · '}
                      {m ? (c.kind === 'channel' || m.authorId === 'me' || !member ? authorName(m.authorId, bots) + ': ' : '') + (m.text || m.tools?.[0]?.tool || '…') : t('Нет сообщений')}
                    </span>
                  )}
                  {unread > 0 && <span className={'badge' + (isMuted ? ' mute' : '')} key={unread}>{unread}</span>}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {running > 0 && <button className="stop-all" onClick={stopAll} title={t('Остановить всех ботов')}>{t('Стоп')} · {running}</button>}

      <div className="sidebar-bottom">
        <button className="user-btn" onClick={() => setModal('settings')} title={t('Настройки')} aria-label={t('Настройки')}>
          <Avatar id="me" size={40} />
          <span className={'live-dot' + (live ? ' on' : '')} title={live ? t('Сервер подключён') : t('Нет связи с сервером')} />
        </button>
        <button className="btn-pill primary" onClick={() => setModal('apps')}><Blocks size={18} /> {t('Conectar apps')}</button>
      </div>
      <nav className="bottom-nav">
        <button className="on"><MessageSquare size={20} />{t('Чаты')}</button>
        <button onClick={() => setModal('accounts')}><Users size={20} />{t('Аккаунты')}</button>
        <button onClick={() => setPanel({ kind: 'workspace' })}><FolderGit2 size={20} />{t('Воркспейс')}</button>
        <button onClick={() => setModal('settings')}><Cog size={20} />{t('Я')}</button>
      </nav>
    </aside>
  )
}
