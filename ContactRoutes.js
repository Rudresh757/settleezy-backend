const express = require('express')
const router  = express.Router()

const { submitContact, getAllContacts, downloadContactCSV } = require('./ContactController')

// POST   /api/contact            - submit contact form
router.post('/', submitContact)

// GET    /api/contact            - get all contacts (JSON)
router.get('/', getAllContacts)

// GET    /api/contact/download/csv  - download CSV
router.get('/download/csv', downloadContactCSV)

module.exports = router
