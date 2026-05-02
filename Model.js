const mongoose = require('mongoose')

const PartnerApplicationSchema = new mongoose.Schema(
  {
    // ── Reference ──────────────────────────────────────────────
    referenceNumber: { type: String, unique: true },
    submittedAt:     { type: Date, default: Date.now },

    // ── Step 1: Category ──────────────────────────────────────
    selectedCategoryCode: { type: String, trim: true },
    selectedCategoryName: { type: String, trim: true },
    selectedSubcats:      { type: [String], default: [] },

    // ── Step 2: Business Info ─────────────────────────────────
    tradingName:      { type: String, trim: true },
    legalName:        { type: String, trim: true },
    regNumber:        { type: String, trim: true },
    yearEstablished:  { type: String, trim: true },
    repFullName:      { type: String, trim: true },
    repJobTitle:      { type: String, trim: true },
    repEmail:         { type: String, trim: true, lowercase: true },
    repPhone:         { type: String, trim: true },
    commLanguage:     { type: String, trim: true },

    // ── Step 3: Physical Location ─────────────────────────────
    streetAddress:      { type: String, trim: true },
    postcode:           { type: String, trim: true },
    city:               { type: String, trim: true },
    district:           { type: String, trim: true },
    googleMapsUrl:      { type: String, trim: true },
    numLocations:       { type: String, trim: true },
    cuisineSpecialty:   { type: String, trim: true },
    seatingCapacity:    { type: String, trim: true },
    avgSpend:           { type: String, trim: true },
    businessDescription:{ type: String, trim: true },
    // Opening hours
    monFriStart:  { type: String }, monFriEnd: { type: String }, monFriClosed: { type: Boolean },
    satStart:     { type: String }, satEnd:    { type: String }, satClosed:    { type: Boolean },
    sunStart:     { type: String }, sunEnd:    { type: String }, sunClosed:    { type: Boolean },
    // Social / marketing
    hasStudentOffer:    { type: String },
    studentOfferDetails:{ type: String, trim: true },
    otherPlatforms:     { type: String, trim: true },
    businessWebsite:    { type: String, trim: true },
    instagramHandle:    { type: String, trim: true },
    tiktokHandle:       { type: String, trim: true },
    otherSocial:        { type: String, trim: true },
    photoRequest:       { type: Boolean },
    marketingContact:   { type: String, trim: true },
    marketingPhone:     { type: String, trim: true },
    visitDays:          { type: [String], default: [] },
    visitTimes:         { type: [String], default: [] },
    offerings:          { type: [String], default: [] },
    contentBudget:      { type: String, trim: true },

    // ── Step 3: Events ────────────────────────────────────────
    organiserName:     { type: String, trim: true },
    eventCity:         { type: String, trim: true },
    typicalVenues:     { type: String, trim: true },
    eventCapacity:     { type: String, trim: true },
    eventFrequency:    { type: String, trim: true },
    eventDescription:  { type: String, trim: true },
    eventWebsite:      { type: String, trim: true },
    eventInstagram:    { type: String, trim: true },
    eventTiktok:       { type: String, trim: true },
    ticketPlatform:    { type: String, trim: true },

    // ── Step 3: Online ────────────────────────────────────────
    serviceUrl:           { type: String, trim: true },
    companyLegalName:     { type: String, trim: true },
    registeredCountry:    { type: String, trim: true },
    serviceDescription:   { type: String, trim: true },
    serviceCoverage:      { type: String, trim: true },
    serviceLanguages:     { type: String, trim: true },
    onlineStudentPricing: { type: String },
    competitorPlatforms:  { type: String, trim: true },
    complianceNotes:      { type: String, trim: true },

    // ── Step 4: Physical Member Benefit ───────────────────────
    benefitType:        { type: String, trim: true },
    benefitDescription: { type: String, trim: true },
    baselinePrice:      { type: String, trim: true },
    benefitValue:       { type: String, trim: true },
    conditions:         { type: String, trim: true },
    timeRestrictions:   { type: [String], default: [] },
    qrConfirmed:        { type: Boolean },
    qrAdditionalLocs:   { type: [String], default: [] },

    // ── Step 4: Events Offer ──────────────────────────────────
    eventOfferTypes:    { type: [String], default: [] },
    eventOfferDesc:     { type: String, trim: true },
    standardDoorPrice:  { type: String, trim: true },
    memberPrice:        { type: String, trim: true },
    eventConditions:    { type: String, trim: true },
    qrEventsConfirmed:  { type: Boolean },

    // ── Step 4: Online/Digital Benefit ────────────────────────
    promoCode:          { type: String, trim: true },
    promoCodeValidity:  { type: String, trim: true },
    promoOnlineBenefit: { type: String, trim: true },
    promoPublicPrice:   { type: String, trim: true },
    promoMemberPrice:   { type: String, trim: true },
    promoConditions:    { type: String, trim: true },

    // ── Step 5: Tier & Pricing ────────────────────────────────
    partnershipPath: { type: String, trim: true },
    postTrialTier:   { type: String, trim: true },
    selectedTier:    { type: String, trim: true },
    addonBoost:      { type: Boolean },
    addonPush:       { type: Boolean },
    addonEvent:      { type: Boolean },
    addonSocial:     { type: Boolean },
    startDate:       { type: String },
    partnershipTerm: { type: String },

    // ── Step 6: Declarations & Signature ─────────────────────
    decl1: { type: Boolean }, decl2: { type: Boolean },
    decl3: { type: Boolean }, decl4: { type: Boolean },
    decl5: { type: Boolean }, decl6: { type: Boolean },
    finalAgree:  { type: Boolean },
    sigFullName: { type: String, trim: true },
    sigJobTitle: { type: String, trim: true },
    sigDate:     { type: String },
  },
  {
    timestamps: true,
    collection: 'partner_applications',
  }
)

module.exports = mongoose.model('PartnerApplication', PartnerApplicationSchema)