const mongoose = require('mongoose')

// ── Partnership Enquiry Form (Service Partner page) ───────────────────────────
const EnquiryFormSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, unique: true },
    submittedAt:     { type: Date, default: Date.now },

    // 01 Contact
    fullName:      { type: String, trim: true },
    businessName:  { type: String, trim: true },
    workEmail:     { type: String, trim: true, lowercase: true },
    phone:         { type: String, trim: true },

    // 02 Business
    businessWebsite:  { type: String, trim: true },
    businessCategory: { type: String, trim: true },
    address:          { type: String, trim: true },
    platforms:        { type: [String], default: [] },  // other platforms listed on

    // 03 Partnership
    offer:         { type: String, trim: true },
    introCall:     { type: String, trim: true },   // 'yes' | 'maybe' | 'no'
    preferredTime: { type: String, trim: true },

    // 04 About
    howHeard:      { type: String, trim: true },
    additionalInfo:{ type: String, trim: true },

    agreeTerms:    { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'enquiry_forms',
  }
)

module.exports = mongoose.model('EnquiryForm', EnquiryFormSchema)
