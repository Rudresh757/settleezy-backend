const test = require('node:test')
const assert = require('node:assert/strict')
const { submitApplication } = require('./Partnercontroller')
const { submitOldPartnerApplication } = require('./OldPartnerController')

function createMockRes() {
  const res = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this.payload = data
      return this
    },
  }
  return res
}

test('new partner endpoint rejects invalid payload', async () => {
  const req = { body: { tradingName: 'ABC Cafe', repEmail: 'bad-email', repPhone: '123abc' } }
  const res = createMockRes()
  await submitApplication(req, res)
  assert.equal(res.statusCode, 400)
  assert.equal(Boolean(res.payload?.message), true)
})

test('old partner endpoint rejects invalid payload', async () => {
  const req = { body: { tradingName: 'ABC Cafe', repEmail: 'bad-email', repPhone: '123abc' } }
  const res = createMockRes()
  await submitOldPartnerApplication(req, res)
  assert.equal(res.statusCode, 400)
  assert.equal(Boolean(res.payload?.message), true)
})
