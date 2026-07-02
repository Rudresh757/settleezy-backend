const test = require('node:test')
const assert = require('node:assert/strict')
const {
  isDeadlinePassed,
  isNewPartnerDeadlinePassed,
  isOldPartnerDeadlinePassed,
  isCommunityPartnerDeadlinePassed,
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

test('new partner deadline is enforced after 30 May 2026', () => {
  assert.equal(isNewPartnerDeadlinePassed(new Date(2026, 4, 31, 0, 0, 0, 0)), true)
})

test('new partner deadline allows submissions on 30 May 2026', () => {
  assert.equal(isNewPartnerDeadlinePassed(new Date(2026, 4, 30, 12, 0, 0, 0)), false)
})

test('old partner deadline is enforced after 16 May 2026', () => {
  assert.equal(isOldPartnerDeadlinePassed(new Date(2026, 4, 17, 0, 0, 0, 0)), true)
})

test('old partner deadline allows submissions on 16 May 2026', () => {
  assert.equal(isOldPartnerDeadlinePassed(new Date(2026, 4, 16, 12, 0, 0, 0)), false)
})

test('legacy isDeadlinePassed matches new partner deadline', () => {
  assert.equal(isDeadlinePassed(new Date(2026, 4, 31, 0, 0, 0, 0)), true)
  assert.equal(isDeadlinePassed(new Date(2026, 4, 30, 12, 0, 0, 0)), false)
})

test('community partner deadline is never enforced (always open)', () => {
  assert.equal(isCommunityPartnerDeadlinePassed(new Date(2026, 6, 1, 0, 0, 0, 0)), false)
  assert.equal(isCommunityPartnerDeadlinePassed(new Date(2026, 5, 30, 12, 0, 0, 0)), false)
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
