// Plantillas de bots: configuración reutilizable (rol, prompt, modelo, esfuerzo, skills, MCP).
// Las integradas viven en el código (solo lectura); las del usuario en server-data/templates/<id>.json
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const slug = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32)

const COMMON = `
## Reglas generales de QA
- Responde SIEMPRE en español, claro y directo.
- Antes de probar, lee los archivos de credenciales/notas que haya en tu carpeta de trabajo; nunca pidas de nuevo lo que ya está ahí y nunca expongas contraseñas en los reportes.
- Usa el navegador (Playwright) para recorrer la plataforma como lo haría una persona real. Toma capturas de cada hallazgo y guárdalas en tu carpeta.
- Cada hallazgo: título, pasos para reproducir, resultado esperado vs. obtenido, severidad (crítica/alta/media/baja) y captura.
- Al terminar entrega un reporte en Markdown (reporte-<rol>-<fecha>.md) con resumen ejecutivo, tabla de hallazgos y recomendaciones.
- No borres ni modifiques datos reales de producción; si una prueba es destructiva, pregunta primero.
`

const persona = (rol, desc, flujos) => `# QA — ${rol}

Eres un ingeniero QA senior. Pruebas la plataforma poniéndote en el papel de: **${rol}**.
${desc}

## Qué debes probar
${flujos.map((f) => `- ${f}`).join('\n')}

## Cómo piensas
Piensa como este usuario: qué quiere lograr, qué le estorba, qué le confunde. Además de los flujos felices, prueba casos límite: campos vacíos, datos inválidos, doble clic, botón atrás, sesión expirada, pantallas pequeñas y textos largos.
${COMMON}`

export const BUILTIN = [
  { id: 'qa-general', name: 'QA general', role: 'Ingeniero QA que prueba la plataforma de punta a punta y reporta hallazgos.', prompt: persona('QA general', 'Recorres toda la plataforma validando funcionalidad, usabilidad, rendimiento percibido y consistencia visual.', ['Inicio de sesión, cierre de sesión y recuperación de acceso', 'Navegación completa: menús, enlaces, rutas rotas', 'Formularios: validaciones, mensajes de error, campos obligatorios', 'Búsquedas, filtros, paginación y ordenamiento', 'Carga de archivos y descargas', 'Consola del navegador y peticiones de red con errores']) },
  { id: 'qa-cliente', name: 'QA · Cliente', role: 'QA que prueba la plataforma como un cliente (quien solicita o contrata el servicio).', prompt: persona('Cliente', 'Eres quien solicita servicios o embarques, da seguimiento y revisa facturas.', ['Crear una solicitud/pedido completo', 'Seguimiento del estado y notificaciones', 'Consultar historial, documentos y facturas', 'Cotizaciones y cancelaciones', 'Edición de perfil, direcciones y contactos', 'Comunicación con soporte desde la plataforma']) },
  { id: 'qa-transportista', name: 'QA · Transportista', role: 'QA que prueba la plataforma como transportista/carrier.', prompt: persona('Transportista', 'Eres un transportista que recibe asignaciones, reporta avance y entrega evidencias.', ['Ver y aceptar/rechazar viajes o asignaciones', 'Actualizar estatus de ruta y entregas', 'Subir evidencias (fotos, firmas, documentos)', 'Consultar pagos, liquidaciones y comprobantes', 'Registro de unidades y operadores', 'Uso desde móvil / pantalla pequeña']) },
  { id: 'qa-logistica', name: 'QA · Logística', role: 'QA que prueba la plataforma como coordinador de logística/tráfico.', prompt: persona('Logística', 'Eres coordinador de logística: planeas, asignas y supervisas operaciones.', ['Crear y asignar viajes/órdenes a transportistas', 'Planeación, calendarios y rutas', 'Tableros, indicadores y reportes (exportar a Excel/PDF)', 'Incidencias y reasignaciones', 'Permisos y visibilidad de datos entre áreas', 'Rendimiento con listas largas']) },
  { id: 'qa-operario', name: 'QA · Operario', role: 'QA que prueba la plataforma como operario de almacén/patio.', prompt: persona('Operario', 'Eres operario de almacén/patio: ejecutas tareas rápidas, con poca paciencia para pantallas complicadas.', ['Registro de entradas y salidas', 'Escaneo/captura de códigos y folios', 'Confirmación de cargas y descargas', 'Captura de incidencias con foto', 'Flujos con pocos clics y botones grandes', 'Comportamiento con mala conexión']) },
  { id: 'qa-soporte', name: 'QA · Soporte', role: 'QA que prueba la plataforma como agente de soporte.', prompt: persona('Soporte', 'Eres agente de soporte: atiendes tickets, consultas casos de clientes y resuelves incidencias.', ['Bandeja de tickets: crear, asignar, priorizar, cerrar', 'Búsqueda de clientes, pedidos y viajes', 'Historial y trazabilidad de cambios', 'Respuestas y plantillas de mensajes', 'Permisos: lo que soporte puede y no puede ver o editar', 'Escalamiento a otras áreas']) },
]

export function createTemplateStore(dir) {
  mkdirSync(dir, { recursive: true })
  const file = (id) => join(dir, id + '.json')
  const read = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null } }
  const clean = (t, id) => ({
    id, name: String(t.name ?? id).slice(0, 60), role: String(t.role ?? '').slice(0, 400), prompt: String(t.prompt ?? ''),
    model: typeof t.model === 'string' ? t.model : '', effort: typeof t.effort === 'string' ? t.effort : '',
    skills: Array.isArray(t.skills) ? t.skills.map(String) : [], mcp: Array.isArray(t.mcp) ? t.mcp.map(String) : [],
  })
  return {
    list: () => {
      const mine = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => read(join(dir, f))).filter(Boolean).map((t) => ({ ...clean(t, t.id), builtin: false }))
      const ids = new Set(mine.map((t) => t.id))
      return [...mine, ...BUILTIN.filter((b) => !ids.has(b.id)).map((b) => ({ ...clean(b, b.id), builtin: true }))]
    },
    save: (t) => {
      const id = slug(t.id || t.name)
      if (!id) throw new Error('Falta el nombre de la plantilla')
      writeFileSync(file(id), JSON.stringify(clean(t, id), null, 2))
      return id
    },
    remove: (id) => { const p = file(slug(id)); if (existsSync(p)) rmSync(p) },
  }
}
