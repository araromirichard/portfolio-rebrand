require('dotenv').config()

const express = require('express')
const cors    = require('cors')

const projectsRouter = require('./routes/projects')
const stacksRouter   = require('./routes/stacks')

const app  = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : true // allow all in dev

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/projects', projectsRouter)
app.use('/api/stacks',   stacksRouter)

app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Portfolio API running on port ${PORT}`)
})
