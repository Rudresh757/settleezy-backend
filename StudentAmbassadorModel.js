const mongoose = require('mongoose')

const StudentAmbassadorApplicationSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, unique: true },
    submittedAt: { type: Date, default: Date.now },

    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    university: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    programme: { type: String, trim: true },
    germanyDuration: { type: String, trim: true },

    platform: { type: String, trim: true },
    handle: { type: String, trim: true },
    followers: { type: String, trim: true },
    secondaryPlatform: { type: String, trim: true },

    motivation: { type: String, trim: true },
    story: { type: String, trim: true },
    approach: { type: String, trim: true },
    
    profileImage: { type: String, trim: true },


    eligEnrolled: { type: Boolean, default: false },
    eligSixMonths: { type: Boolean, default: false },
    eligContent: { type: Boolean, default: false },
    eligVoluntary: { type: Boolean, default: false },
    consentGdpr: { type: Boolean, default: false },
    consentWhatsapp: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'student_ambassador_applications',
  }
)

module.exports = mongoose.model('StudentAmbassadorApplication', StudentAmbassadorApplicationSchema)
