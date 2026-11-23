import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import catalogRoutes from './routes/catalog.routes.js'
import adminRoutes from './routes/admin.routes.js'
import checkoutRoutes, { stripeWebhook } from './routes/checkout.routes.js'
import seoRoutes from './routes/seo.routes.js'
import { notFound, errorHandler } from './middleware/error.js'

const app = express()

// Number of proxies in front of the app, so rate limiting sees real customer IPs.
// Railway's edge = 1; Vercel → Railway = 2 (set TRUST_PROXY=2 on Railway).
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1))

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))

// Stripe signs the exact raw body, so this route must come before express.json().
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhook)

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Mako Sports API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', checkoutRoutes)
app.use('/api', catalogRoutes)
app.use(seoRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
// Express 5 passes startup errors (e.g. port already in use) to this callback instead of throwing.
app.listen(PORT, (err) => {
  if (err) {
    console.error(
      err.code === 'EADDRINUSE'
        ? `Port ${PORT} is already in use. Is the server already running in another terminal?`
        : `Server failed to start: ${err.message}`,
    )
    process.exit(1)
  }
  console.log(`Server running on http://localhost:${PORT}`)
})