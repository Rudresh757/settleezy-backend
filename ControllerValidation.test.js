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
  const originalDate = global.Date
  const FakeDate = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        super(2026, 4, 10) // May 10, 2026 (before new partner deadline of May 30)
      } else {
        super(...args)
      }
    }
  }
  global.Date = FakeDate

  try {
    const req = { body: { tradingName: 'ABC Cafe', repEmail: 'bad-email', repPhone: '123abc' } }
    const res = createMockRes()
    await submitApplication(req, res)
    assert.equal(res.statusCode, 400)
    assert.equal(Boolean(res.payload?.message), true)
  } finally {
    global.Date = originalDate
  }
})

test('old partner endpoint rejects invalid payload', async () => {
  const originalDate = global.Date
  const FakeDate = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        super(2026, 4, 10) // May 10, 2026 (before old partner deadline of May 16)
      } else {
        super(...args)
      }
    }
  }
  global.Date = FakeDate

  try {
    const req = { body: { tradingName: 'ABC Cafe', repEmail: 'bad-email', repPhone: '123abc' } }
    const res = createMockRes()
    await submitOldPartnerApplication(req, res)
    assert.equal(res.statusCode, 400)
    assert.equal(Boolean(res.payload?.message), true)
  } finally {
    global.Date = originalDate
  }
})
