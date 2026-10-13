import { useEffect, useRef, useState } from 'react'
import { Users, Pin, MoreVertical, BellOff, Bell, LogOut, Ban, ChevronLeft, ArrowDown, Monitor } from 'lucide-react'
import { useStore } from '../store'
import MessageView from './MessageView'
import Composer from './Composer'
import { Avatar } from './ui'
import { t } from '../i18n'

// Panel de actividad abierto por defecto una sola vez, en pantallas anchas
let autoOpened = false

export default function ChatView() {
  const { channels, messages, active, bots, typing, setPanel, panel, muted, toggleMute, leaveChannel, block, backToList, setModal } = useStore()
  const [away, setAway] = useState(false)
  const nearBottom = useRef(true)
  const boxRef = useRef<HTMLDivElement>(null)
  const [menu, setMenu] = useState(false)
  const ch = channels.find((c) => c.id === active)
  const list = messages.filter((m) => m.channelId === active && !m.threadOf)
  const endRef = useRef<HTMLDivElement>(null)
  const last = messages[messages.length - 1]

  useEffect(() => { if (nearBottom.current) endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }) }, [list.length, last?.text, last?.tools?.length])
  useEffect(() => { nearBottom.current = true; setAway(false); endRef.current?.scrollIntoView({ block: 'end' }) }, [active])
  useEffect(() => setMenu(false), [active])
  useEffect(() => {
    if (autoOpened || !ch) return
    autoOpened = true
    if (window.innerWidth >= 1280 && panel.kind === 'none') setPanel({ kind: 'activity' })
  }, [ch, panel.kind, setPanel])

  if (!ch) {
    // Пустая сессия: ни ботов, ни групп. Иначе просто не выбран чат.
    return (
      <main className="chat empty">
        <div className="empty-card">
          <div className="dots big"><u /><u /><u /></div>
          {channels.length === 0 ? (
            <>
              <h2>{t('Здесь пока пусто')}</h2>
              <p>{t('В этой сессии нет ботов и групп. Создайте первого бота, потом можно собрать из ботов группу.')}</p>
              <div className="row-btns">
                <button className="btn primary" onClick={() => setModal('createBot')}>{t('Создать бота')}</button>
                <button className="btn" disabled={bots.length === 0} onClick={() => setModal('createGroup')}>{t('Создать группу')}</button>
              </div>
            </>
          ) : <h2>{t('Выберите чат')}</h2>}
        </div>
      </main>
    )
  }

  const member = ch.members.includes('me')
  const bot = ch.kind === 'dm' ? bots.find((b) => b.id === (ch.members.find((x) => x !== 'me') ?? ch.members[0])) : undefined
  const pinned = list.filter((m) => m.pinned).length
  const typers = (typing[active] ?? []).map((id) => bots.find((b) => b.id === id)?.name).filter(Boolean)
  const isMuted = muted.includes(ch.id)
  return (
    <main className={'chat' + (bot ? ' dm' : '')}>
      <header className="chat-head">
        <button className="btn-circle back-btn" onClick={backToList}><ChevronLeft /></button>
        <button className="head-pill" onClick={() => (bot ? setPanel({ kind: 'bot', id: bot.id }) : setPanel({ kind: 'members' }))} title={bot ? bot.role : undefined}>
          {bot ? <Avatar id={bot.id} size={26} /> : <Avatar id={ch.id} size={26} />}
          <b>{ch.kind === 'channel' ? '# ' : ''}{ch.name}</b>
          {isMuted && <BellOff size={13} className="muted-ico" />}
          {typers.length > 0 && <i className="dots"><u /><u /><u /></i>}
        </button>
        <div className="head-actions">
          {pinned > 0 && <span className="pill"><Pin size={12} /> {pinned}</span>}
          {ch.kind === 'channel' && (
            <button className={'btn-circle' + (panel.kind === 'members' ? ' on' : '')} title={t('Участники')} onClick={() => setPanel(panel.kind === 'members' ? { kind: 'none' } : { kind: 'members' })}><Users /></button>
          )}
          <button className={'btn-circle' + (panel.kind === 'activity' ? ' on' : '')} title={t('Активность')} aria-label={t('Активность')} onClick={() => setPanel(panel.kind === 'activity' ? { kind: 'none' } : { kind: 'activity' })}><Monitor /></button>
          <div className="menu-wrap">
            <button className="btn-circle" onClick={() => setMenu(!menu)}><MoreVertical /></button>
            {menu && (
              <>
                <div className="menu-back" onClick={() => setMenu(false)} />
                <div className="menu">
                  <button onClick={() => { toggleMute(ch.id); setMenu(false) }}>{isMuted ? <Bell size={16} /> : <BellOff size={16} />} {isMuted ? t('Включить звук') : t('Заглушить')}</button>
                  {ch.kind === 'channel' && member && <button className="danger" onClick={() => { leaveChannel(ch.id); setMenu(false) }}><LogOut size={16} /> {t('Покинуть группу')}</button>}
                  {bot && member && <button className="danger" onClick={() => { block(bot.id); setMenu(false) }}><Ban size={16} /> {t('Заблокировать')}</button>}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="messages" key={active} ref={boxRef} onScroll={(e) => { const el = e.currentTarget; const d = el.scrollHeight - el.scrollTop - el.clientHeight; nearBottom.current = d < 120; setAway(d > 260) }}>
        <div className="date-chip">{t('Сегодня')}</div>
        {list.map((m, i) => {
          const prev = list[i - 1]
          const next = list[i + 1]
          const near = (a?: typeof m, b?: typeof m) => !!a && !!b && a.authorId === b.authorId && Math.abs(a.ts - b.ts) < 5 * 60_000
          if (m.system) return <div className="sys-msg" key={m.id}>{m.text}</div>
          return <MessageView key={m.id} msg={m} showName={ch.kind === 'channel'} pos={{ first: !near(prev, m), last: !near(m, next) }} />
        })}
        <div ref={endRef} />
      </div>

      {away && <button className="to-bottom" onClick={() => endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })}><ArrowDown size={18} /></button>}
      {member ? <Composer channelId={active} placeholder={bot ? t('Написать {name}', { name: bot.name }) : undefined} /> : <div className="spectate">{t('Вы наблюдаете за перепиской. Писать здесь могут только участники.')}</div>}
    </main>
  )
}
