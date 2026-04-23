const mongoose = require('mongoose')

// ── Contact Form ──────────────────────────────────────────────────────────────
const ContactFormSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, unique: true },
    submittedAt:     { type: Date, default: Date.now },

    topic:        { type: String, trim: true },
    firstName:    { type: String, trim: true },
    lastName:     { type: String, trim: true },
    email:        { type: String, trim: true, lowercase: true },
    phone:        { type: String, trim: true },
    personType:   { type: String, trim: true },   // "I am a…"
    organisation: { type: String, trim: true },
    subject:      { type: String, trim: true },
    message:      { type: String, trim: true },
    responseMethod: { type: String, trim: true },
    howHeard:     { type: String, trim: true },
    gdprConsent:  { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'contact_forms',
  }
)

module.exports = mongoose.model('ContactForm', ContactFormSchema)
