const { Parser } = require('json2csv')
const StudentAmbassadorApplication = require('./StudentAmbassadorModel')
// const { sendFormEmails } = require('./EmailService')  // ── EMAIL DISABLED ──

function generateRef() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `SAP-${year}-${rand}`
}

const requiredFields = ['fullName','email','university','programme','germanyDuration','platform','handle','motivation','story','approach']

// POST /api/student-ambassador — Save to DB, respond immediately, no email
async function submitStudentAmbassadorApplication(req, res) {
  try {
    const body = req.body || {}

    const missingField = requiredFields.find((field) => !String(body[field] || '').trim())
    if (missingField) return res.status(400).json({ success: false, message: `${missingField} is required.` })

    if (!body.eligEnrolled || !body.eligSixMonths || !body.eligContent || !body.eligVoluntary || !body.consentGdpr) {
      return res.status(400).json({ success: false, message: 'All required eligibility and GDPR consent checkboxes must be accepted.' })
    }

    const ref = generateRef()
    const doc = new StudentAmbassadorApplication({ ...body, referenceNumber: ref, submittedAt: new Date() })
    await doc.save()

    // ── EMAIL BLOCK (disabled — uncomment to re-enable) ──────────────────────
    // const mailErrors = await sendFormEmails({
    //   formLabel: 'Student Ambassador Application', ref,
    //   recipientEmail: body.email,
    //   adminSubject: `[Student Ambassador Application] ${body.fullName} - ${ref}`,
    //   userSubject: `We received your Student Ambassador Program application - Settleezy (${ref})`,
    //   fields: [
    //     ['Reference', ref], ['Full Name', body.fullName], ['Email', body.email],
    //     ['University', body.university], ['WhatsApp', body.whatsapp],
    //     ['Programme', body.programme], ['Time in Germany', body.germanyDuration],
    //     ['Primary Platform', body.platform], ['Handle', body.handle], ['Follower Count', body.followers],
    //     ['Secondary Platform', body.secondaryPlatform], ['Motivation', body.motivation],
    //     ['Student Story', body.story], ['Campus Approach', body.approach],
    //     ['Enrolled in Berlin', body.eligEnrolled ? 'Yes' : 'No'],
    //     ['Resident 6+ Months', body.eligSixMonths ? 'Yes' : 'No'],
    //     ['Content Commitment', body.eligContent ? 'Yes' : 'No'],
    //     ['Voluntary Role Accepted', body.eligVoluntary ? 'Yes' : 'No'],
    //     ['GDPR Consent', body.consentGdpr ? 'Yes' : 'No'],
    //     ['WhatsApp Consent', body.consentWhatsapp ? 'Yes' : 'No'],
    //     ['Submitted At', new Date().toLocaleString('en-GB', { timeZone: 'Europe/Berlin' })],
    //   ],
    // })
    // if (mailErrors.length) {
    //   return res.status(502).json({ success: false, message: 'Application saved, but email delivery failed.', ref, mailErrors })
    // }
    // ── END EMAIL BLOCK ──────────────────────────────────────────────────────

    return res.status(201).json({ success: true, message: 'Student ambassador application submitted successfully.', ref })
  } catch (err) {
    console.error('submitStudentAmbassadorApplication error:', err)
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Duplicate reference. Please retry.' })
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' })
  }
}

// GET /api/student-ambassador
async function getAllStudentAmbassadorApplications(req, res) {
  try {
    const docs = await StudentAmbassadorApplication.find().sort({ submittedAt: -1 }).lean()
    return res.status(200).json({ success: true, count: docs.length, data: docs })
  } catch (err) {
    console.error('getAllStudentAmbassadorApplications error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// GET /api/student-ambassador/download/csv
async function downloadStudentAmbassadorApplicationsCSV(req, res) {
  try {
    const docs = await StudentAmbassadorApplication.find().sort({ submittedAt: -1 }).lean()
    if (!docs.length) return res.status(404).json({ success: false, message: 'No student ambassador applications to export.' })

    const flattened = docs.map((doc) => ({
      ...doc,
      _id: doc._id?.toString(),
      submittedAt: doc.submittedAt ? new Date(doc.submittedAt).toISOString() : '',
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : '',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : '',
    }))

    const fields = [
      'referenceNumber','submittedAt','fullName','email','university','whatsapp',
      'programme','germanyDuration','platform','handle','followers','secondaryPlatform',
      'motivation','story','approach','profileImage',
      'eligEnrolled','eligSixMonths','eligContent','eligVoluntary','consentGdpr','consentWhatsapp',
      '_id','createdAt','updatedAt',
    ]


    const parser = new Parser({ fields })
    const csv = parser.parse(flattened)
    const filename = `student-ambassador-applications-${new Date().toISOString().slice(0, 10)}.csv`
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(csv)
  } catch (err) {
    console.error('downloadStudentAmbassadorApplicationsCSV error:', err)
    return res.status(500).json({ success: false, message: 'CSV export failed.' })
  }
}

module.exports = { submitStudentAmbassadorApplication, getAllStudentAmbassadorApplications, downloadStudentAmbassadorApplicationsCSV }
