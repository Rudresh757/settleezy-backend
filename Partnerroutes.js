const express = require('express')
const router  = express.Router()

const {
  submitApplication,
  getAllApplications,
  downloadCSV,
} = require('./Partnercontroller')

// ─── Routes ───────────────────────────────────────────────────────────────────

// @route   POST   /api/partner-applications
// @desc    Submit a new partner application
// @access  Public
router.post('/', submitApplication)

// @route   GET    /api/partner-applications
// @desc    Get all applications (JSON) - use for admin dashboard
// @access  Public (add auth middleware here when ready)
router.get('/', getAllApplications)

// @route   GET    /api/partner-applications/download/csv
// @desc    Download all applications as a CSV file
// @access  Public (add auth middleware here when ready)
router.get('/download/csv', downloadCSV)

module.exports = router