const express = require('express')
const router = express.Router()

const {
  requireAdminApiKey,
  subscribeToNewsletter,
  getAllSubscribers,
  downloadSubscribersCSV,
} = require('./NewsletterController')

// POST /api/newsletter/subscribe  — public subscribe endpoint used by frontend
router.post('/subscribe', subscribeToNewsletter)

// Backend-only admin APIs (require x-admin-api-key header)
router.get('/subscribers', requireAdminApiKey, getAllSubscribers)
router.get('/subscribers/download/csv', requireAdminApiKey, downloadSubscribersCSV)

module.exports = router
