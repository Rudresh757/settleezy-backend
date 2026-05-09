const express = require('express')
const router  = express.Router()

const {
  submitCommunityPartnerApplication,
  getAllCommunityPartnerApplications,
  downloadCommunityPartnerCSV,
} = require('./CommunityPartnerController')

// @route   POST   /api/community-partner-applications
router.post('/', submitCommunityPartnerApplication)

// @route   GET    /api/community-partner-applications
router.get('/', getAllCommunityPartnerApplications)

// @route   GET    /api/community-partner-applications/download/csv
router.get('/download/csv', downloadCommunityPartnerCSV)

module.exports = router
