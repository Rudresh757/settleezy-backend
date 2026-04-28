const PartnerApplication = require('./Model')
const { sendFormEmails } = require('./EmailService')
const { Parser }         = require('json2csv')
const { isDeadlinePassed, validatePartnerPayload } = require('./Validation')

// ── Helper: generate reference number ──────────────────────────────────────
function generateRef() {
  console.log('[PartnerController] generateRef called')
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `PAR-${year}-${rand}`
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/partner-applications
// Submit a new partner application and persist it to MongoDB.
// ─────────────────────────────────────────────────────────────────────────────
const submitApplication = async (req, res) => {
  console.log('[PartnerController] submitApplication called')
  try {
    const formData = req.body

    if (isDeadlinePassed()) {
      return res.status(410).json({
        success: false,
        message: 'Submission window closed after 15 May. Contact partners@settleezy.de to participate.',
      })
    }
    const validationError = validatePartnerPayload(formData)
    if (validationError) return res.status(400).json({ success: false, message: validationError })

    const ref = generateRef()

    const application = new PartnerApplication({
      ...formData,
      referenceNumber: ref,
      submittedAt:     new Date(),
      selectedSubcats:  Array.isArray(formData.selectedSubcats)  ? formData.selectedSubcats  : [],
      visitDays:        Array.isArray(formData.visitDays)        ? formData.visitDays        : [],
      visitTimes:       Array.isArray(formData.visitTimes)       ? formData.visitTimes       : [],
      offerings:        Array.isArray(formData.offerings)        ? formData.offerings        : [],
      timeRestrictions: Array.isArray(formData.timeRestrictions) ? formData.timeRestrictions : [],
      qrAdditionalLocs: Array.isArray(formData.qrAdditionalLocs) ? formData.qrAdditionalLocs : [],
      eventOfferTypes:  Array.isArray(formData.eventOfferTypes)  ? formData.eventOfferTypes  : [],
    })

    await application.save()

    // ── Send emails ──────────────────────────────────────────────────────────
    const recipientEmail = formData.repEmail || formData.workEmail || ''
    const businessName   = formData.tradingName || formData.organiserName || formData.companyLegalName || 'Partner'

    const mailErrors = await sendFormEmails({
      formLabel:      'Partner Contract Form',
      ref,
      recipientEmail,
      adminSubject:   `[Partner Contract Form] New application from ${businessName} — ${ref}`,
      userSubject:    `Your Settleezy Partner Application received (${ref})`,
      fields: [
        ['Reference',           ref],
        ['Category',            `${formData.selectedCategoryName || ''} (${formData.selectedCategoryCode || ''})`],
        ['Sub-categories',      (formData.selectedSubcats || []).join(', ')],
        ['Trading Name',        formData.tradingName],
        ['Legal Name',          formData.legalName],
        ['Reg. Number',         formData.regNumber],
        ['Year Established',    formData.yearEstablished],
        ['Rep. Full Name',      formData.repFullName],
        ['Rep. Job Title',      formData.repJobTitle],
        ['Rep. Email',          formData.repEmail],
        ['Rep. Phone',          formData.repPhone],
        ['City',                formData.city],
        ['Postcode',            formData.postcode],
        ['Street Address',      formData.streetAddress],
        ['Selected Tier',       formData.selectedTier],
        ['Partnership Term',    formData.partnershipTerm],
        ['Start Date',          formData.startDate],
        ['Signatory Name',      formData.sigFullName],
        ['Signatory Job Title', formData.sigJobTitle],
        ['Signed Date',         formData.sigDate],
        ['Submitted At',        new Date().toLocaleString('en-GB', { timeZone: 'Europe/Berlin' })],
      ],
    })

    if (mailErrors.length) {
      return res.status(502).json({
        success: false,
        message: 'Partner application saved, but email delivery failed.',
        ref,
        id: application._id,
        mailErrors,
      })
    }

    return res.status(201).json({ success: true, message: 'Partner application submitted successfully.', ref, id: application._id })
  } catch (err) {
    console.error('submitApplication error:', err)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate reference number. Please try submitting again.' })
    }
    return res.status(500).json({ success: false, message: 'Server error. Please try again later.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/partner-applications
// Return all applications as JSON
// ─────────────────────────────────────────────────────────────────────────────
const getAllApplications = async (req, res) => {
  console.log('[PartnerController] getAllApplications called')
  try {
    const applications = await PartnerApplication.find().sort({ submittedAt: -1 }).lean()
    return res.status(200).json({ success: true, count: applications.length, data: applications })
  } catch (err) {
    console.error('getAllApplications error:', err)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/partner-applications/download/csv
// Stream all applications as a downloadable CSV file
// ─────────────────────────────────────────────────────────────────────────────
const downloadCSV = async (req, res) => {
  console.log('[PartnerController] downloadCSV called')
  try {
    const applications = await PartnerApplication.find().sort({ submittedAt: -1 }).lean()

    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'No applications found to export.' })
    }

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
      'serviceCoverage','serviceLanguages','onlineStudentPricing','competitorPlatforms',
      'complianceNotes',
      'benefitType','benefitDescription','baselinePrice','benefitValue','conditions',
      'timeRestrictions','qrConfirmed','qrAdditionalLocs',
      'eventOfferTypes','eventOfferDesc','standardDoorPrice','memberPrice',
      'eventConditions','qrEventsConfirmed',
      'promoCode','promoCodeValidity','promoOnlineBenefit','promoPublicPrice',
      'promoMemberPrice','promoConditions',
      'selectedTier','addonBoost','addonPush','addonEvent','addonSocial',
      'startDate','partnershipTerm',
      'decl1','decl2','decl3','decl4','decl5','decl6','finalAgree',
      'sigFullName','sigJobTitle','sigDate',
      '_id','createdAt','updatedAt',
    ]

    const parser   = new Parser({ fields })
    const csv      = parser.parse(flattened)
    const filename = `partner-contract-forms-${new Date().toISOString().slice(0, 10)}.csv`

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(csv)
  } catch (err) {
    console.error('downloadCSV error:', err)
    return res.status(500).json({ success: false, message: 'CSV export failed.' })
  }
}

module.exports = { submitApplication, getAllApplications, downloadCSV }