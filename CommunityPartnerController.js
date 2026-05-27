const CommunityPartnerApplication = require('./CommunityPartnerModel')
// const { sendFormEmails } = require('./EmailService')  // ── EMAIL DISABLED ──
const { Parser } = require('json2csv')
const { isCommunityPartnerDeadlinePassed, validatePartnerPayload } = require('./Validation')

function generateRef() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `CPA-${year}-${rand}`
}

// POST /api/community-partner-applications
const submitCommunityPartnerApplication = async (req, res) => {
  try {
    const formData = req.body

    if (isCommunityPartnerDeadlinePassed()) {
      return res.status(410).json({
        success: false,
        message: 'Submission window closed after 30 June 2026. Contact partners@settleezy.de to participate.',
      })
    }

    const validationError = validatePartnerPayload(formData)
    if (validationError) return res.status(400).json({ success: false, message: validationError })

    const ref = generateRef()
    const application = new CommunityPartnerApplication({
      ...formData,
      referenceNumber:  ref,
      submittedAt:      new Date(),
      selectedSubcats:  Array.isArray(formData.selectedSubcats)  ? formData.selectedSubcats  : [],
      visitDays:        Array.isArray(formData.visitDays)        ? formData.visitDays        : [],
      visitTimes:       Array.isArray(formData.visitTimes)       ? formData.visitTimes       : [],
      offerings:        Array.isArray(formData.offerings)        ? formData.offerings        : [],
      timeRestrictions: Array.isArray(formData.timeRestrictions) ? formData.timeRestrictions : [],
      qrAdditionalLocs: Array.isArray(formData.qrAdditionalLocs) ? formData.qrAdditionalLocs : [],
      eventOfferTypes:  Array.isArray(formData.eventOfferTypes)  ? formData.eventOfferTypes  : [],
    })

    await application.save()

    return res.status(201).json({
      success: true,
      message: 'Community partner application submitted successfully.',
      ref,
      id: application._id,
    })
  } catch (err) {
    console.error('submitCommunityPartnerApplication error:', err)
    if (err.code === 11000)
      return res.status(409).json({ success: false, message: 'Duplicate reference number. Please try submitting again.' })
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' })
  }
}

// GET /api/community-partner-applications
const getAllCommunityPartnerApplications = async (req, res) => {
  try {
    const applications = await CommunityPartnerApplication.find().sort({ submittedAt: -1 }).lean()
    return res.status(200).json({ success: true, count: applications.length, data: applications })
  } catch (err) {
    console.error('getAllCommunityPartnerApplications error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// GET /api/community-partner-applications/download/csv
const downloadCommunityPartnerCSV = async (req, res) => {
  try {
    const applications = await CommunityPartnerApplication.find().sort({ submittedAt: -1 }).lean()
    if (applications.length === 0)
      return res.status(404).json({ success: false, message: 'No applications found to export.' })

    const flattened = applications.map((app) => ({
      ...app,
      _id:              app._id?.toString(),
      selectedSubcats:  (app.selectedSubcats  || []).join('; '),
      visitDays:        (app.visitDays        || []).join('; '),
      visitTimes:       (app.visitTimes       || []).join('; '),
      offerings:        (app.offerings        || []).join('; '),
      timeRestrictions: (app.timeRestrictions || []).join('; '),
      qrAdditionalLocs: (app.qrAdditionalLocs || []).join('; '),
      eventOfferTypes:  (app.eventOfferTypes  || []).join('; '),
      submittedAt:      app.submittedAt ? new Date(app.submittedAt).toISOString() : '',
      createdAt:        app.createdAt   ? new Date(app.createdAt).toISOString()   : '',
      updatedAt:        app.updatedAt   ? new Date(app.updatedAt).toISOString()   : '',
    }))

    const fields = [
      'referenceNumber','submittedAt','selectedCategoryCode','selectedCategoryName',
      'selectedSubcats','tradingName','legalName','regNumber','yearEstablished',
      'repFullName','repJobTitle','repEmail','repPhone','commLanguage',
      'streetAddress','postcode','city','district','googleMapsUrl','numLocations',
      'cuisineSpecialty','seatingCapacity','avgSpend','businessDescription',
      'monFriStart','monFriEnd','monFriClosed','satStart','satEnd','satClosed',
      'sunStart','sunEnd','sunClosed','hasStudentOffer','studentOfferDetails',
      'otherPlatforms','businessWebsite','instagramHandle','tiktokHandle','otherSocial',
      'photoRequest','marketingContact','marketingPhone','visitDays','visitTimes',
      'offerings','contentBudget',
      'organiserName','eventCity','typicalVenues','eventCapacity','eventFrequency',
      'eventDescription','eventWebsite','eventInstagram','eventTiktok','ticketPlatform',
      'serviceUrl','companyLegalName','registeredCountry','serviceDescription',
      'serviceCoverage','serviceLanguages','onlineStudentPricing','competitorPlatforms','complianceNotes',
      'benefitType','benefitDescription','baselinePrice','benefitValue','conditions',
      'timeRestrictions','qrConfirmed','qrAdditionalLocs',
      'eventOfferTypes','eventOfferDesc','standardDoorPrice','memberPrice','eventConditions','qrEventsConfirmed',
      'promoCode','promoCodeValidity','promoOnlineBenefit','promoPublicPrice','promoMemberPrice','promoConditions',
      'partnershipPath','postTrialTier','selectedTier','startDate','partnershipTerm',
      'decl1','decl2','decl3','decl4','decl5','decl6','finalAgree',
      'sigFullName','sigJobTitle','sigDate','signatureImage',
      'imageEntrance','imageInteriorMain','imageInteriorDetail','imageProduct','imageLogo',
      '_id','createdAt','updatedAt',
    ]

    const parser = new Parser({ fields })
    const csv = parser.parse(flattened)
    const filename = `community-partner-forms-${new Date().toISOString().slice(0, 10)}.csv`
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(csv)
  } catch (err) {
    console.error('downloadCommunityPartnerCSV error:', err)
    return res.status(500).json({ success: false, message: 'CSV export failed.' })
  }
}

module.exports = {
  submitCommunityPartnerApplication,
  getAllCommunityPartnerApplications,
  downloadCommunityPartnerCSV,
}
