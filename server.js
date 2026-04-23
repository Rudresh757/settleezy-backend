require('dotenv').config()
const express        = require('express')
const cors           = require('cors')
const connectDB      = require('./Db')
const partnerRoutes  = require('./Partnerroutes')
const contactRoutes  = require('./ContactRoutes')
const enquiryRoutes  = require('./EnquiryRoutes')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB()

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true,
}))

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API Routes ────────────────────────────────────────────────────────────────
// Partner Contract Form  →  POST/GET /api/partner-applications
//                           GET      /api/partner-applications/download/csv
app.use('/api/partner-applications', partnerRoutes)

// Contact Form           →  POST/GET /api/contact
//                           GET      /api/contact/download/csv
app.use('/api/contact', contactRoutes)

// Partnership Enquiry    →  POST/GET /api/enquiries
//                           GET      /api/enquiries/download/csv
app.use('/api/enquiries', enquiryRoutes)

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Settleezy API running on http://localhost:${PORT}`)
  console.log(`   Partner Applications → /api/partner-applications`)
  console.log(`   Contact Form         → /api/contact`)
  console.log(`   Partnership Enquiry  → /api/enquiries`)
  console.log(`   CSV Downloads        → /api/<route>/download/csv`)
})