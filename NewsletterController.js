const NewsletterSubscriber = require('./NewsletterModel')
// const { sendFormEmails } = require('./EmailService')  // ── EMAIL DISABLED ──
const { Parser } = require('json2csv')

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function requireAdminApiKey(req, res, next) {
  return next()
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/newsletter
// Save subscriber to DB and respond immediately — no email sent.
// ─────────────────────────────────────────────────────────────────────────────
const subscribeToNewsletter = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email)

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'A valid email is required.' })
    }

    const existing = await NewsletterSubscriber.findOne({ email }).lean()
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed.',
        subscribed: true,
        alreadySubscribed: true,
      })
    }

    const doc = new NewsletterSubscriber({ email, subscribedAt: new Date() })
    await doc.save()

    // ── EMAIL BLOCK (disabled — uncomment to re-enable) ──────────────────────
    // const mailErrors = await sendFormEmails({
    //   formLabel: 'Newsletter Subscription',
    //   ref: '',
    //   recipientEmail: email,
    //   adminSubject: `[Newsletter] New subscription from ${email}`,
    //   userSubject: 'You are subscribed to Settleezy updates',
    //   fields: [
    //     ['Email', email],
    //     ['Subscribed At', new Date().toLocaleString('en-GB', { timeZone: 'Europe/Berlin' })],
    //   ],
    // })
    // if (mailErrors.length) {
    //   return res.status(502).json({
    //     success: false,
    //     message: 'Subscription saved, but confirmation email failed.',
    //     subscribed: false,
    //     mailErrors,
    //   })
    // }
    // ── END EMAIL BLOCK ──────────────────────────────────────────────────────

    return res.status(201).json({ success: true, message: 'Subscribed successfully.', subscribed: true })
  } catch (err) {
    console.error('subscribeToNewsletter error:', err)
    if (err.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed.',
        subscribed: true,
        alreadySubscribed: true,
      })
    }
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/newsletter
// ─────────────────────────────────────────────────────────────────────────────
const getAllSubscribers = async (req, res) => {
  try {
    const docs = await NewsletterSubscriber.find().sort({ subscribedAt: -1 }).lean()
    return res.status(200).json({ success: true, count: docs.length, data: docs })
  } catch (err) {
    console.error('getAllSubscribers error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/newsletter/download/csv
// ─────────────────────────────────────────────────────────────────────────────
const downloadSubscribersCSV = async (req, res) => {
  try {
    const docs = await NewsletterSubscriber.find().sort({ subscribedAt: -1 }).lean()

    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'No newsletter subscribers to export.' })
    }

    const flattened = docs.map((d) => ({
      _id: d._id?.toString(),
      email: d.email,
      isActive: d.isActive,
      subscribedAt: d.subscribedAt ? new Date(d.subscribedAt).toISOString() : '',
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : '',
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : '',
    }))

    const fields = ['email', 'isActive', 'subscribedAt', '_id', 'createdAt', 'updatedAt']
    const parser = new Parser({ fields })
    const csv = parser.parse(flattened)
    const filename = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(csv)
  } catch (err) {
    console.error('downloadSubscribersCSV error:', err)
    return res.status(500).json({ success: false, message: 'CSV export failed.' })
  }
}

module.exports = { requireAdminApiKey, subscribeToNewsletter, getAllSubscribers, downloadSubscribersCSV }
