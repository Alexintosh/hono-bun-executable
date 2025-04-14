import { Hono, Context } from 'hono'
import { serveStatic } from 'hono/bun'
import * as path from 'node:path'
import { join } from 'node:path'

//const appDistPath = join(import.meta.dir, '../../app/dist')



console.log(path.dirname('./'))
console.log('Current working directory:', process.cwd());
console.log('Executable directory:', path.dirname(process.execPath));
const appDistPath = join(path.dirname(process.execPath), './app')

console.log(path.resolve(appDistPath))

const indexPath = join(appDistPath, 'index.html')

const api = new Hono()

// Serve static assets from the /assets directory within app-dist
api.get('/assets/*', serveStatic({ root: appDistPath }))

// Serve the main index.html file
api.get('/', async (c: Context) => c.html(await Bun.file(indexPath).text()))

// API routes
api.get('/api/*', (c: Context) => c.text('Hello Bun!'))

export default api
