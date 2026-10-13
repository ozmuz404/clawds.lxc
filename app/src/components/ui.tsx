import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useStore } from '../store'
import { t, locale } from '../i18n'

/* ---------- Аватары: у каждого бота свой «зверёк», собранный из хеша имени ---------- */

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export const MASCOT_COLORS = ['#FF3D9A', '#2D7DFF', '#B5733F', '#9B6BFF', '#17C3A2', '#3DDC97', '#FF8A3D', '#F5C542']
export const mascotColor = (id: string, boss?: boolean) => (boss ? '#F4F4F4' : MASCOT_COLORS[hash(id) % MASCOT_COLORS.length])

// Mascota: un color estable por bot (hash del id); el bot principal es blanco y puede llevar estrella
export function Avatar({ id, size = 40, star = false }: { id: string; size?: number; star?: boolean }) {
  const bot = useStore((s) => s.bots.find((b) => b.id === id))
  const busy = useStore((s) => Object.values(s.typing).some((a) => a.includes(id)))
  const meName = useStore((s) => s.accounts.me?.name)
  if (id === 'me') {
    const ch = (meName && meName !== 'Вы' ? meName : 'R').trim().charAt(0).toUpperCase()
    return <span className="avatar user-avatar" style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }} aria-hidden>{ch}</span>
  }
  const fill = mascotColor(id, bot?.boss)
  return (
    <span className="avatar-wrap" style={{ width: size, height: size }}>
      <svg className={'avatar' + (busy ? ' busy' : '')} width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <path d="M32 6C47 6 58 15 58 30C58 47 52 58 36 58H26C11 58 6 47 6 30C6 15 17 6 32 6Z" fill={fill} />
        <ellipse cx="23" cy="30" rx="3.4" ry="5.6" fill="#0A0A0A" fillOpacity=".85" />
        <ellipse cx="41" cy="30" rx="3.4" ry="5.6" fill="#0A0A0A" fillOpacity=".85" />
      </svg>
      {star && bot?.boss && (
        <svg className="avatar-star" width="20" height="20" viewBox="0 0 24 24" aria-hidden><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9Z" fill="#F5A524" /></svg>
      )}
    </span>
  )
}

/* ---------- Свой набор реакций ---------- */

export const REACTIONS = ['ok', 'ship', 'eyes', 'heart', 'bolt', 'think'] as const

export function Emoji({ k, size = 18 }: { k: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true } as const
  switch (k) {
    case 'ok':
      return <svg {...p}><path d="M12 2.5c3 0 5 1.6 7 2.8 1.2 2 2.5 4 2.5 6.7s-1.3 4.7-2.5 6.7c-2 1.2-4 2.8-7 2.8s-5-1.6-7-2.8C3.8 16.7 2.5 14.7 2.5 12s1.3-4.7 2.5-6.7C7 4.1 9 2.5 12 2.5Z" fill="oklch(0.82 0.16 140)" /><path d="M7.5 12.3l3 3 6-6.6" fill="none" stroke="oklch(0.22 0.04 140)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'ship':
      return <svg {...p}><path d="M3 11.5L21 3l-6.5 18-3.2-7.3Z" fill="oklch(0.78 0.14 60)" /><path d="M11.3 13.7L21 3" stroke="oklch(0.3 0.06 60)" strokeWidth="1.6" strokeLinecap="round" /><path d="M3 11.5l8.3 2.2" stroke="oklch(0.3 0.06 60)" strokeWidth="1.6" strokeLinecap="round" /></svg>
    case 'eyes':
      return <svg {...p}><ellipse cx="7.5" cy="12" rx="4.6" ry="6" fill="#f4efe6" /><ellipse cx="16.5" cy="12" rx="4.6" ry="6" fill="#f4efe6" /><circle cx="8.8" cy="13" r="2.3" fill="oklch(0.25 0.03 80)" /><circle cx="17.8" cy="13" r="2.3" fill="oklch(0.25 0.03 80)" /></svg>
    case 'heart':
      return <svg {...p}><path d="M12 21C5 16.2 2.5 12.6 2.5 9A4.9 4.9 0 0 1 12 7.3 4.9 4.9 0 0 1 21.5 9c0 3.6-2.5 7.2-9.5 12Z" fill="oklch(0.7 0.18 20)" /><path d="M6.5 8.6a2.6 2.6 0 0 1 2.4-1.4" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" fill="none" /></svg>
    case 'bolt':
      return <svg {...p}><path d="M13.5 2L4.5 13.5H11L9.8 22l9.7-12.2H13Z" fill="oklch(0.88 0.17 100)" stroke="oklch(0.4 0.08 90)" strokeWidth="1.2" strokeLinejoin="round" /></svg>
    case 'think':
      return <svg {...p}><path d="M7 18.5C3.6 18.5 2 16.2 2 14c0-2 1.4-3.6 3.4-3.9C5.8 7 8.2 5 11.3 5c2.6 0 4.7 1.4 5.6 3.5 2.6.1 4.6 2 4.6 4.6 0 3-2.2 5.4-5.2 5.4Z" fill="oklch(0.78 0.06 220)" /><circle cx="9" cy="12.4" r="1.2" fill="oklch(0.28 0.04 230)" /><circle cx="13" cy="12.4" r="1.2" fill="oklch(0.28 0.04 230)" /><circle cx="17" cy="12.4" r="1.2" fill="oklch(0.28 0.04 230)" /></svg>
    default:
      return <span>{k}</span>
  }
}

/* ---------- Остальное ---------- */

export function authorName(id: string, bots: { id: string; name: string }[]) {
  return id === 'me' ? t('Вы') : bots.find((b) => b.id === id)?.name ?? id
}

// Адреса файлов сервер хранит как http://127.0.0.1:порт/files/…; с другого компьютера они не открываются, поэтому берём адрес относительно страницы
export const fileUrl = (u: string) => (location.port === '5173' ? u : u.replace(/^https?:\/\/(127\.0\.0\.1|localhost):\d+(?=\/files\/)/, ''))

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className={'modal' + (wide ? ' wide' : '')} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button className={'toggle' + (on ? ' on' : '')} disabled={disabled} onClick={() => onChange(!on)}>
      <span />
    </button>
  )
}

export function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })
}

export function fmtAgo(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000)
  if (m < 1) return t('только что')
  if (m < 60) return t('{m} мин назад', { m })
  const h = Math.round(m / 60)
  if (h < 24) return t('{h} ч назад', { h })
  const d = Math.round(h / 24)
  return d === 1 ? t('вчера') : t('{d} дн назад', { d })
}
export const folderName = (p: string) => p.split(/[\\/]/).filter(Boolean).pop() ?? p

export function fmtReset(ts: number) {
  if (!ts) return '—'
  const m = Math.max(0, Math.round((ts - Date.now()) / 60000))
  if (m < 60) return t('{m} мин', { m })
  const h = Math.floor(m / 60)
  if (h < 48) return t('{h} ч {m} мин', { h, m: m % 60 })
  return t('{d} дн', { d: Math.round(h / 24) })
}

/* ---------- Профиль, тосты, вложения ---------- */

export function UserAvatar({ id, size = 40 }: { id: string; size?: number }) {
  const openProfile = useStore((s) => s.openProfile)
  return (
    <button className="av-btn" title={t('Профиль')} onClick={(e) => { e.stopPropagation(); openProfile(id) }}>
      <Avatar id={id} size={size} />
    </button>
  )
}

export function handle(a: { username: string; number: string; primary: 'username' | 'number' }) {
  return a.primary === 'username' ? { main: '@' + a.username, alt: a.number } : { main: a.number, alt: '@' + a.username }
}

export function fmtSize(n: number) {
  if (n < 1024) return n + ' ' + t('Б')
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' ' + t('КБ')
  return (n / 1024 / 1024).toFixed(1) + ' ' + t('МБ')
}

export function Toast() {
  const toast = useStore((s) => s.toast)
  if (!toast) return null
  return <div className="toast" key={toast.id}>{toast.text}</div>
}
