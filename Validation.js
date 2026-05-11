/** New partner applications (standard route) — inclusive through end of 25 May 2026 CET */
const NEW_PARTNER_DEADLINE = new Date(2026, 4, 25, 23, 59, 59, 999)
/** Existing / old partner relaunch form — inclusive through end of 16 May 2026 CET */
const OLD_PARTNER_DEADLINE = new Date(2026, 4, 16, 23, 59, 59, 999)
/** Student Ambassador Program — inclusive through end of 30 May 2026 CET */
const STUDENT_AMBASSADOR_DEADLINE = new Date(2026, 4, 30, 23, 59, 59, 999)

/** @deprecated Use isNewPartnerDeadlinePassed or isOldPartnerDeadlinePassed */
const DEADLINE_DATE = NEW_PARTNER_DEADLINE

function isNewPartnerDeadlinePassed(now = new Date()) {
  return now > NEW_PARTNER_DEADLINE
}

function isOldPartnerDeadlinePassed(now = new Date()) {
  return now > OLD_PARTNER_DEADLINE
}

function isStudentAmbassadorDeadlinePassed(now = new Date()) {
  return now > STUDENT_AMBASSADOR_DEADLINE
}

function isDeadlinePassed(now = new Date()) {
  return isNewPartnerDeadlinePassed(now)
}

function isValidEmail(email = '') {
  console.log('[Validation] isValidEmail called')
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

function isDigitsOnlyPhone(phone = '') {
  console.log('[Validation] isDigitsOnlyPhone called')
  const cleaned = String(phone).replace(/\s+/g, '')
  return /^\d{7,15}$/.test(cleaned)
}

function validatePartnerPayload(formData = {}) {
  console.log('[Validation] validatePartnerPayload called')
  if (!formData.tradingName && !formData.organiserName && !formData.companyLegalName) {
    return 'Missing required business identifier (tradingName / organiserName / companyLegalName)'
  }
  if (!String(formData.repFullName || '').trim()) return 'Representative full name is required'
  if (!String(formData.repEmail || '').trim()) return 'Representative email is required'
  if (!isValidEmail(formData.repEmail)) return 'Invalid representative email format'
  if (!String(formData.repPhone || '').trim()) return 'Representative phone is required'
  if (!isDigitsOnlyPhone(formData.repPhone)) return 'Phone must contain digits only (7-15)'
  if (!String(formData.selectedTier || '').trim()) return 'Please select a partnership tier'
  return null
}

module.exports = {
  DEADLINE_DATE,
  NEW_PARTNER_DEADLINE,
  OLD_PARTNER_DEADLINE,
  STUDENT_AMBASSADOR_DEADLINE,
  isDeadlinePassed,
  isNewPartnerDeadlinePassed,
  isOldPartnerDeadlinePassed,
  isStudentAmbassadorDeadlinePassed,
  isValidEmail,
  isDigitsOnlyPhone,
  validatePartnerPayload,
}
