const ContactForm = require('./ContactModel')
// const { sendFormEmails } = require('./EmailService')  // ── EMAIL DISABLED ──
const { Parser } = require('json2csv')

function generateRef() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `CTF-${year}-${rand}`
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/contact
// Save contact form to DB and respond immediately - no email sent.
// ─────────────────────────────────────────────────────────────────────────────
const submitContact = async (req, res) => {
  try {
    const body = req.body

    if (!body.firstName || !body.email || !body.message) {
      return res.status(400).json({
        success: false,
        message: 'firstName, email and message are required.',
      })
    }

    const ref = generateRef()
    const doc = new ContactForm({ ...body, referenceNumber: ref, submittedAt: new Date() })
    await doc.save()

    // ── EMAIL BLOCK (disabled - uncomment to re-enable) ──────────────────────
    // const mailErrors = await sendFormEmails({
    //   formLabel: 'Contact Form',
    //   ref,
    //   recipientEmail: body.email,
    //   adminSubject: `[Contact Form] New message from ${body.firstName} ${body.lastName || ''} - ${ref}`,
    //   userSubject: `We received your message - Settleezy (${ref})`,
    //   fields: [
    //     ['Reference',       ref],
    //     ['Topic',           body.topic],
    //     ['Name',            `${body.firstName} ${body.lastName || ''}`],
    //     ['Email',           body.email],
    //     ['Phone',           body.phone],
    //     ['Person Type',     body.personType],
    //     ['Organisation',    body.organisation],
    //     ['Subject',         body.subject],
    //     ['Message',         body.message],
    //     ['Response Method', body.responseMethod],
    //     ['How Heard',       body.howHeard],
    //     ['GDPR Consent',    body.gdprConsent ? 'Yes' : 'No'],
    //     ['Submitted At',    new Date().toLocaleString('en-GB', { timeZone: 'Europe/Berlin' })],
    //   ],
    // })
    // if (mailErrors.length) {
    //   return res.status(502).json({
    //     success: false,
    //     message: 'Contact form saved, but email delivery failed.',
    //     ref,
    //     mailErrors,
    //   })
    // }
    // ── END EMAIL BLOCK ──────────────────────────────────────────────────────

    return res.status(201).json({ success: true, message: 'Contact form submitted successfully.', ref })
  } catch (err) {
    console.error('submitContact error:', err)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate reference. Please retry.' })
    }
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/contact
// ─────────────────────────────────────────────────────────────────────────────
const getAllContacts = async (req, res) => {
  try {
    const docs = await ContactForm.find().sort({ submittedAt: -1 }).lean()
    return res.status(200).json({ success: true, count: docs.length, data: docs })
  } catch (err) {
    console.error('getAllContacts error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/contact/download/csv
// ─────────────────────────────────────────────────────────────────────────────
const downloadContactCSV = async (req, res) => {
  try {
    const docs = await ContactForm.find().sort({ submittedAt: -1 }).lean()

    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'No contact submissions to export.' })
    }

    const flattened = docs.map((d) => ({
      ...d,
      _id: d._id?.toString(),
      submittedAt: d.submittedAt ? new Date(d.submittedAt).toISOString() : '',
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : '',
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : '',
    }))

    const fields = [
      'referenceNumber', 'submittedAt',
      'topic', 'firstName', 'lastName', 'email', 'phone',
      'personType', 'organisation', 'subject', 'message',
      'responseMethod', 'howHeard', 'gdprConsent',
      '_id', 'createdAt', 'updatedAt',
    ]

    const parser = new Parser({ fields })
    const csv = parser.parse(flattened)
    const filename = `contact-forms-${new Date().toISOString().slice(0, 10)}.csv`

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(csv)
  } catch (err) {
    console.error('downloadContactCSV error:', err)
    return res.status(500).json({ success: false, message: 'CSV export failed.' })
  }
}

module.exports = { submitContact, getAllContacts, downloadContactCSV }
