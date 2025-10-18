import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'

const PORT = 3001
const TARGET = 'http://localhost:8000'

type NodeRequestInit = RequestInit & { duplex?: 'half' }

const app = new Hono()

app.use('*', cors({
	origin: 'http://localhost:5173',
	credentials: true,
	exposeHeaders: ['mcp-session-id', 'Connection', 'Accept', 'User-Agent', 'mcp-protocol-version'],
}))
app.get('/healthz', c => c.text('ok'))

app.all('*', async c => {
  const inUrl = new URL(c.req.url)
  const upstream = new URL(c.req.path + inUrl.search, TARGET);
	
  const reqHeaders = new Headers(c.req.raw.headers)
  
  const init: NodeRequestInit = {
    method: c.req.method,
    headers: reqHeaders,
    body: ['GET', 'HEAD'].includes(c.req.method) ? undefined : c.req.raw.body,
    duplex: 'half'
  }

  const res = await fetch(upstream, init)

  const resHeaders = new Headers(res.headers)
  
  return new Response(res.body, { status: res.status, headers: resHeaders })
})

serve({ fetch: app.fetch, port: PORT })
