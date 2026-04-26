const express = require('express')
const router = express.Router()

const {
  submitOldPartnerApplication,
  getAllOldPartnerApplications,
  downloadOldPartnerCSV,
} = require('./OldPartnerController')

router.post('/', submitOldPartnerApplication)
router.get('/', getAllOldPartnerApplications)
router.get('/download/csv', downloadOldPartnerCSV)

module.exports = router
