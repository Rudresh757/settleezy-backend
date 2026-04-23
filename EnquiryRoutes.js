const express = require('express')
const router  = express.Router()

const { submitEnquiry, getAllEnquiries, downloadEnquiryCSV } = require('./EnquiryController')

// POST   /api/enquiries            — submit partnership enquiry
router.post('/', submitEnquiry)

// GET    /api/enquiries            — get all enquiries (JSON)
router.get('/', getAllEnquiries)

// GET    /api/enquiries/download/csv  — download CSV
router.get('/download/csv', downloadEnquiryCSV)

module.exports = router
