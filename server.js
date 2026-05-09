require('dotenv').config()
const express        = require('express')
const cors           = require('cors')
const mongoose       = require('mongoose')
const connectDB      = require('./Db')
const partnerRoutes  = require('./Partnerroutes')
const oldPartnerRoutes = require('./OldPartnerRoutes')
const contactRoutes  = require('./ContactRoutes')
const enquiryRoutes  = require('./EnquiryRoutes')
const newsletterRoutes = require('./NewsletterRoutes')
const studentAmbassadorRoutes = require('./StudentAmbassadorRoutes')
const communityPartnerRoutes  = require('./CommunityPartnerRoutes')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB()

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://settleezy.de',
  'https://www.settleezy.de',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(o => o.trim()) : [])
].filter((value, index, self) => self.indexOf(value) === index && value)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    console.warn(`⛔ CORS blocked origin: ${origin}`)
    return callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-api-key'],
  credentials: true,
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))  // handle pre-flight for all routes

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown'
  res.json({
    status: 'ok',
    db: dbStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// ── API Routes ────────────────────────────────────────────────────────────────
// Partner Contract Form  →  POST/GET /api/partner-applications
//                           GET      /api/partner-applications/download/csv
app.use('/api/partner-applications', partnerRoutes)
app.use('/api/old-partner-applications', oldPartnerRoutes)

// Contact Form           →  POST/GET /api/contact
//                           GET      /api/contact/download/csv
app.use('/api/contact', contactRoutes)

// Partnership Enquiry    →  POST/GET /api/enquiries
//                           GET      /api/enquiries/download/csv
app.use('/api/enquiries', enquiryRoutes)

// Newsletter             →  POST     /api/newsletter/subscribe
//                          GET      /api/newsletter/subscribers (admin key required)
//                          GET      /api/newsletter/subscribers/download/csv (admin key required)
app.use('/api/newsletter', newsletterRoutes)

// Student Ambassador     →  POST/GET /api/student-ambassador-applications
//                          GET      /api/student-ambassador-applications/download/csv
app.use('/api/student-ambassador-applications', studentAmbassadorRoutes)

// Community Partner    →  POST/GET /api/community-partner-applications
//                          GET      /api/community-partner-applications/download/csv
app.use('/api/community-partner-applications', communityPartnerRoutes)

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Handle CORS errors specifically
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: err.message })
  }
  console.error('Unhandled error:', err.stack)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Settleezy API running on http://localhost:${PORT}`)
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`)
  console.log(`   Partner Applications → /api/partner-applications`)
  console.log(`   Old Partner Apps     → /api/old-partner-applications`)
  console.log(`   Contact Form         → /api/contact`)
  console.log(`   Partnership Enquiry  → /api/enquiries`)
  console.log(`   Newsletter           → /api/newsletter/subscribe`)
  console.log(`   Student Ambassador   → /api/student-ambassador-applications`)
  console.log(`   Community Partner    → /api/community-partner-applications`)
  console.log(`   CSV Downloads        → /api/<route>/download/csv`)
  console.log(`   Health Check         → /health`)
})