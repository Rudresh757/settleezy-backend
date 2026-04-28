const EnquiryForm        = require('./EnquiryModel')
const { sendFormEmails } = require('./EmailService')
const { Parser }         = require('json2csv')

// ── Reference generator ──────────────────────────────────────────────────────
function generateRef() {
  console.log('[EnquiryController] generateRef called')
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `ENF-${year}-${rand}`
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/enquiries
// Save partnership enquiry + send emails
// ─────────────────────────────────────────────────────────────────────────────
const submitEnquiry = async (req, res) => {
  console.log('[EnquiryController] submitEnquiry called')
  try {
    const body = req.body

    // Flatten nested shape sent by Servicepartner.jsx
    const flat = {
      fullName:         body.contactInfo?.fullName      || body.fullName,
      businessName:     body.contactInfo?.businessName  || body.businessName,
      workEmail:        body.contactInfo?.workEmail      || body.workEmail,
      phone:            body.contactInfo?.phone          || body.phone,
      businessWebsite:  body.businessDetails?.website   || body.businessWebsite,
      businessCategory: body.businessDetails?.category  || body.businessCategory,
      address:          body.businessDetails?.address    || body.address,
      platforms:        Array.isArray(body.businessDetails?.otherPlatforms)
                          ? body.businessDetails.otherPlatforms
                          : Array.isArray(body.platforms) ? body.platforms : [],
      offer:            body.partnershipDetails?.offer   || body.offer,
      introCall:        body.partnershipDetails?.introCall || body.introCall,
      preferredTime:    body.partnershipDetails?.preferredTime || body.preferredTime,
      howHeard:         body.aboutYou?.howHeard          || body.howHeard,
      additionalInfo:   body.aboutYou?.additionalInfo    || body.additionalInfo,
      agreeTerms:       body.agreeTerms || false,
    }

    if (!flat.fullName || !flat.workEmail) {
      return res.status(400).json({
        success: false,
        message: 'fullName and workEmail are required.',
      })
    }

    const ref = generateRef()
    const doc = new EnquiryForm({ ...flat, referenceNumber: ref, submittedAt: new Date() })
    await doc.save()

    const mailErrors = await sendFormEmails({
      formLabel:      'Partnership Enquiry Form',
      ref,
      recipientEmail: flat.workEmail,
      adminSubject:   `[Enquiry Form] New enquiry from ${flat.businessName || flat.fullName} — ${ref}`,
      userSubject:    `Your Settleezy Partnership Enquiry received (${ref})`,
      fields: [
        ['Reference',          ref],
        ['Full Name',          flat.fullName],
        ['Business Name',      flat.businessName],
        ['Work Email',         flat.workEmail],
        ['Phone',              flat.phone],
        ['Business Website',   flat.businessWebsite],
        ['Business Category',  flat.businessCategory],
        ['Address',            flat.address],
        ['Other Platforms',    flat.platforms.join(', ')],
        ['Offer Description',  flat.offer],
        ['Intro Call',         flat.introCall],
        ['Preferred Time',     flat.preferredTime],
        ['How Heard',          flat.howHeard],
        ['Additional Info',    flat.additionalInfo],
        ['Agreed to Terms',    flat.agreeTerms ? 'Yes' : 'No'],
        ['Submitted At',       new Date().toLocaleString('en-GB', { timeZone: 'Europe/Berlin' })],
      ],
    })

    if (mailErrors.length) {
      return res.status(502).json({
        success: false,
        message: 'Enquiry saved, but email delivery failed.',
        ref,
        referenceNumber: ref,
        mailErrors,
      })
    }

    return res.status(201).json({ success: true, message: 'Partnership enquiry submitted successfully.', ref, referenceNumber: ref })
  } catch (err) {
    console.error('submitEnquiry error:', err)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate reference. Please retry.' })
    }
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/enquiries
// Fetch all enquiries as JSON
// ─────────────────────────────────────────────────────────────────────────────
const getAllEnquiries = async (req, res) => {
  console.log('[EnquiryController] getAllEnquiries called')
  try {
    const docs = await EnquiryForm.find().sort({ submittedAt: -1 }).lean()
    return res.status(200).json({ success: true, count: docs.length, data: docs })
  } catch (err) {
    console.error('getAllEnquiries error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/enquiries/download/csv
// Download all enquiries as CSV
// ─────────────────────────────────────────────────────────────────────────────
const downloadEnquiryCSV = async (req, res) => {
  console.log('[EnquiryController] downloadEnquiryCSV called')
  try {
    const docs = await EnquiryForm.find().sort({ submittedAt: -1 }).lean()

    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'No enquiry submissions to export.' })
    }

    const flattened = docs.map((d) => ({
      ...d,
      _id:         d._id?.toString(),
      platforms:   (d.platforms || []).join('; '),
      submittedAt: d.submittedAt ? new Date(d.submittedAt).toISOString() : '',
      createdAt:   d.createdAt   ? new Date(d.createdAt).toISOString()   : '',
      updatedAt:   d.updatedAt   ? new Date(d.updatedAt).toISOString()   : '',
    }))

    const fields = [
      'referenceNumber', 'submittedAt',
      'fullName', 'businessName', 'workEmail', 'phone',
      'businessWebsite', 'businessCategory', 'address', 'platforms',
      'offer', 'introCall', 'preferredTime',
      'howHeard', 'additionalInfo', 'agreeTerms',
      '_id', 'createdAt', 'updatedAt',
    ]

    const parser   = new Parser({ fields })
    const csv      = parser.parse(flattened)
    const filename = `enquiry-forms-${new Date().toISOString().slice(0, 10)}.csv`

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(csv)
  } catch (err) {
    console.error('downloadEnquiryCSV error:', err)
    return res.status(500).json({ success: false, message: 'CSV export failed.' })
  }
}

module.exports = { submitEnquiry, getAllEnquiries, downloadEnquiryCSV }
