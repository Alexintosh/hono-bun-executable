import { Hono, Context } from 'hono'
import { serveStatic } from 'hono/bun'
import { join } from 'node:path'

const appDistPath = join(import.meta.dir, '../app-dist')
const indexPath = join(appDistPath, 'index.html')

const api = new Hono()

// Serve static assets from the /assets directory within app-dist
api.get('/assets/*', serveStatic({ root: appDistPath }))

// Serve the main index.html file
api.get('/', async (c: Context) => c.html(await Bun.file(indexPath).text()))

// API routes
api.get('/api/*', (c: Context) => c.text('Hello Bun!'))

export default api
