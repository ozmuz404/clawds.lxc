// Локализация: русские строки служат ключами, английский берётся из locales/en.ts.
// Строка без перевода показывается как есть. Параметры: t('Ботов: {n}', { n: 3 }).
import { EN } from './locales/en'

export type Lang = 'ru' | 'en' | 'es'
const KEY = 'clawds.lang'

function detect(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'ru' || saved === 'en' || saved === 'es') return saved
  } catch { /* без хранилища */ }
  return typeof navigator !== 'undefined' && /^ru\b/i.test(navigator.language) ? 'ru' : /^es\b/i.test(navigator.language) ? 'es' : 'en'
}

let lang: Lang = detect()
export const getLang = () => lang
export const setLangValue = (l: Lang) => {
  lang = l
  try { localStorage.setItem(KEY, l) } catch { /* без хранилища */ }
  document.documentElement.lang = l
}
document.documentElement.lang = lang

export function t(s: string, p?: Record<string, string | number>): string {
  let r = lang !== 'ru' ? EN[s] ?? s : s
  if (p) r = r.replace(/\{(\w+)\}/g, (_, k) => String(p[k] ?? ''))
  return r
}

export const locale = () => (lang === 'ru' ? 'ru-RU' : lang === 'es' ? 'es-MX' : 'en-US')
