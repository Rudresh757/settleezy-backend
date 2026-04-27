const test = require('node:test')
const assert = require('node:assert/strict')
const {
  isDeadlinePassed,
  isValidEmail,
  isDigitsOnlyPhone,
  validatePartnerPayload,
} = require('./Validation')

test('accepts valid email addresses', () => {
  assert.equal(isValidEmail('partner@example.com'), true)
})

test('rejects invalid email addresses', () => {
  assert.equal(isValidEmail('invalid-email'), false)
})

test('accepts digit-only phone number with spaces', () => {
  assert.equal(isDigitsOnlyPhone('123 456 7890'), true)
})

test('rejects phone numbers containing non-digits', () => {
  assert.equal(isDigitsOnlyPhone('+49-12345'), false)
})

test('deadline is enforced after 15 May 2026', () => {
  assert.equal(isDeadlinePassed(new Date(2026, 4, 16, 0, 0, 0, 0)), true)
})

test('deadline allows submissions on 15 May 2026', () => {
  assert.equal(isDeadlinePassed(new Date(2026, 4, 15, 12, 0, 0, 0)), false)
})

test('valid payload passes validation', () => {
  const error = validatePartnerPayload({
    tradingName: 'Cafe ABC',
    repFullName: 'John Doe',
    repEmail: 'john@example.com',
    repPhone: '9876543210',
    selectedTier: 'reach',
  })
  assert.equal(error, null)
})

test('missing selectedTier fails validation', () => {
  const error = validatePartnerPayload({
    tradingName: 'Cafe ABC',
    repFullName: 'John Doe',
    repEmail: 'john@example.com',
    repPhone: '9876543210',
  })
  assert.equal(error, 'Please select a partnership tier')
})
