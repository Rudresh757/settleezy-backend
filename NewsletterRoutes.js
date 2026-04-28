const express = require('express')
const router = express.Router()

const {
  subscribeToNewsletter,
  getAllSubscribers,
  downloadSubscribersCSV,
} = require('./NewsletterController')

// POST /api/newsletter/subscribe  — public subscribe endpoint used by frontend
router.post('/subscribe', subscribeToNewsletter)

// Public read/export APIs
router.get('/subscribers', getAllSubscribers)
router.get('/subscribers/download/csv', downloadSubscribersCSV)

module.exports = router
