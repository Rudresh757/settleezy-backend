const express = require('express')
const router = express.Router()

const {
  submitStudentAmbassadorApplication,
  getAllStudentAmbassadorApplications,
  downloadStudentAmbassadorApplicationsCSV,
} = require('./StudentAmbassadorController')

router.post('/', submitStudentAmbassadorApplication)
router.get('/', getAllStudentAmbassadorApplications)
router.get('/download/csv', downloadStudentAmbassadorApplicationsCSV)

module.exports = router
