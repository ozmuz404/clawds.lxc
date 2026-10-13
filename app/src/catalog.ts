// Каталог MCP-серверов для окна «Подключить приложения». Только то, что работает через команду или токен:
// серверы с входом через браузер (OAuth) сюда не входят, их можно добавить вручную.
export type CatField = { key: string; label: string; kind: 'env' | 'arg' | 'header'; placeholder?: string }
export type CatItem = {
  id: string
  name: string
  desc: string
  cat: 'files' | 'dev' | 'search' | 'data' | 'work'
  rec?: boolean
  type: 'stdio' | 'http'
  command?: string
  args?: string[]
  url?: string
  fields?: CatField[]
}

export const CATS: { id: CatItem['cat'] | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'files', label: 'Файлы' },
  { id: 'dev', label: 'Разработка' },
  { id: 'search', label: 'Поиск' },
  { id: 'data', label: 'Данные' },
  { id: 'work', label: 'Работа' },
]

export const CATALOG: CatItem[] = [
  { id: 'filesystem', name: 'Filesystem', desc: 'Читать и менять файлы в выбранной папке', cat: 'files', rec: true, type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem'], fields: [{ key: 'dir', label: 'Папка', kind: 'arg', placeholder: 'D:\\projects' }] },
  { id: 'fetch', name: 'Fetch', desc: 'Загружать страницы и превращать их в Markdown', cat: 'search', rec: true, type: 'stdio', command: 'uvx', args: ['mcp-server-fetch'] },
  { id: 'playwright', name: 'Playwright', desc: 'Управлять браузером: открывать сайты, кликать, снимать экран', cat: 'dev', rec: true, type: 'stdio', command: 'npx', args: ['-y', '@playwright/mcp@latest', '--headless'] },
  { id: 'github', name: 'GitHub', desc: 'Репозитории, issue и pull request', cat: 'dev', rec: true, type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'], fields: [{ key: 'GITHUB_PERSONAL_ACCESS_TOKEN', label: 'Токен доступа GitHub', kind: 'env', placeholder: 'ghp_…' }] },
  { id: 'memory', name: 'Memory', desc: 'Граф знаний: боты запоминают факты между чатами', cat: 'data', type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-memory'] },
  { id: 'sequential-thinking', name: 'Sequential Thinking', desc: 'Пошаговое рассуждение для сложных задач', cat: 'work', type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-sequential-thinking'] },
  { id: 'git', name: 'Git', desc: 'История, ветки и diff локальных репозиториев', cat: 'dev', type: 'stdio', command: 'uvx', args: ['mcp-server-git'] },
  { id: 'context7', name: 'Context7', desc: 'Свежая документация библиотек прямо в запросе', cat: 'dev', type: 'http', url: 'https://mcp.context7.com/mcp' },
  { id: 'brave-search', name: 'Brave Search', desc: 'Поиск в интернете через Brave', cat: 'search', type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-brave-search'], fields: [{ key: 'BRAVE_API_KEY', label: 'API-ключ Brave', kind: 'env' }] },
  { id: 'postgres', name: 'PostgreSQL', desc: 'Читать базу данных Postgres (только чтение)', cat: 'data', type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-postgres'], fields: [{ key: 'url', label: 'Строка подключения', kind: 'arg', placeholder: 'postgresql://user:pass@host/db' }] },
  { id: 'sqlite', name: 'SQLite', desc: 'Запросы к локальной базе SQLite', cat: 'data', type: 'stdio', command: 'uvx', args: ['mcp-server-sqlite', '--db-path'], fields: [{ key: 'db', label: 'Файл базы', kind: 'arg', placeholder: 'D:\\data\\app.db' }] },
  { id: 'slack', name: 'Slack', desc: 'Читать каналы и писать сообщения', cat: 'work', type: 'stdio', command: 'npx', args: ['-y', '@modelcontextprotocol/server-slack'], fields: [{ key: 'SLACK_BOT_TOKEN', label: 'Токен бота (xoxb-…)', kind: 'env' }, { key: 'SLACK_TEAM_ID', label: 'ID рабочего пространства', kind: 'env' }] },
  { id: 'notion', name: 'Notion', desc: 'Страницы и базы Notion', cat: 'work', type: 'stdio', command: 'npx', args: ['-y', '@notionhq/notion-mcp-server'], fields: [{ key: 'NOTION_TOKEN', label: 'Токен интеграции', kind: 'env', placeholder: 'ntn_…' }] },
  { id: 'time', name: 'Time', desc: 'Текущее время и часовые пояса', cat: 'work', type: 'stdio', command: 'uvx', args: ['mcp-server-time'] },
]
