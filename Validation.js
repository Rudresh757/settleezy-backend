const DEADLINE_DATE = new Date(2026, 4, 15, 23, 59, 59, 999)

function isDeadlinePassed(now = new Date()) {
  console.log('[Validation] isDeadlinePassed called')
  return now > DEADLINE_DATE
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
  isDeadlinePassed,
  isValidEmail,
  isDigitsOnlyPhone,
  validatePartnerPayload,
}
