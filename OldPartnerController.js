const OldPartnerApplication = require('./OldPartnerModel')
const { sendFormEmails } = require('./EmailService')
const { Parser } = require('json2csv')

function generateRef() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `OPA-${year}-${rand}`
}

const submitOldPartnerApplication = async (req, res) => {
  try {
    const formData = req.body
    if (!formData.tradingName && !formData.organiserName && !formData.companyLegalName) {
      return res.status(400).json({ success: false, message: 'Missing required business identifier (tradingName / organiserName / companyLegalName)' })
    }

    const ref = generateRef()
    const application = new OldPartnerApplication({
      ...formData,
      referenceNumber: ref,
      submittedAt: new Date(),
      selectedSubcats: Array.isArray(formData.selectedSubcats) ? formData.selectedSubcats : [],
      visitDays: Array.isArray(formData.visitDays) ? formData.visitDays : [],
      visitTimes: Array.isArray(formData.visitTimes) ? formData.visitTimes : [],
      offerings: Array.isArray(formData.offerings) ? formData.offerings : [],
      timeRestrictions: Array.isArray(formData.timeRestrictions) ? formData.timeRestrictions : [],
      qrAdditionalLocs: Array.isArray(formData.qrAdditionalLocs) ? formData.qrAdditionalLocs : [],
      eventOfferTypes: Array.isArray(formData.eventOfferTypes) ? formData.eventOfferTypes : [],
    })
    await application.save()

    const recipientEmail = formData.repEmail || formData.workEmail || ''
    const businessName = formData.tradingName || formData.organiserName || formData.companyLegalName || 'Partner'
    await sendFormEmails({
      formLabel: 'Old Partner Form',
      ref,
      recipientEmail,
      adminSubject: `[Old Partner Form] Submission from ${businessName} — ${ref}`,
      userSubject: `Your Settleezy old partner form was received (${ref})`,
      fields: [
        ['Reference', ref],
        ['Category', `${formData.selectedCategoryName || ''} (${formData.selectedCategoryCode || ''})`],
        ['Sub-categories', (formData.selectedSubcats || []).join(', ')],
        ['Trading Name', formData.tradingName],
        ['Rep. Full Name', formData.repFullName],
        ['Rep. Email', formData.repEmail],
        ['Rep. Phone', formData.repPhone],
        ['City', formData.city],
        ['Submitted At', new Date().toLocaleString('en-GB', { timeZone: 'Europe/Berlin' })],
      ],
    })

    return res.status(201).json({ success: true, message: 'Old partner form submitted successfully.', ref, id: application._id })
  } catch (err) {
    console.error('submitOldPartnerApplication error:', err)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate reference number. Please try submitting again.' })
    }
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' })
  }
}

const getAllOldPartnerApplications = async (req, res) => {
  try {
    const applications = await OldPartnerApplication.find().sort({ submittedAt: -1 }).lean()
    return res.status(200).json({ success: true, count: applications.length, data: applications })
  } catch (err) {
    console.error('getAllOldPartnerApplications error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

const downloadOldPartnerCSV = async (req, res) => {
  try {
    const applications = await OldPartnerApplication.find().sort({ submittedAt: -1 }).lean()
    if (applications.length === 0) return res.status(404).json({ success: false, message: 'No applications found to export.' })

    const flattened = applications.map((app) => ({
      ...app,
      _id: app._id?.toString(),
      selectedSubcats: (app.selectedSubcats || []).join('; '),
      visitDays: (app.visitDays || []).join('; '),
      visitTimes: (app.visitTimes || []).join('; '),
      offerings: (app.offerings || []).join('; '),
      timeRestrictions: (app.timeRestrictions || []).join('; '),
      qrAdditionalLocs: (app.qrAdditionalLocs || []).join('; '),
      eventOfferTypes: (app.eventOfferTypes || []).join('; '),
      submittedAt: app.submittedAt ? new Date(app.submittedAt).toISOString() : '',
      createdAt: app.createdAt ? new Date(app.createdAt).toISOString() : '',
      updatedAt: app.updatedAt ? new Date(app.updatedAt).toISOString() : '',
    }))

    const fields = Object.keys(flattened[0] || {})
    const parser = new Parser({ fields })
    const csv = parser.parse(flattened)
    const filename = `old-partner-forms-${new Date().toISOString().slice(0, 10)}.csv`
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(csv)
  } catch (err) {
    console.error('downloadOldPartnerCSV error:', err)
    return res.status(500).json({ success: false, message: 'CSV export failed.' })
  }
}

module.exports = { submitOldPartnerApplication, getAllOldPartnerApplications, downloadOldPartnerCSV }
