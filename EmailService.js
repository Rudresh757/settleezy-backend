require('dotenv').config()
const nodemailer = require('nodemailer')

// ─── Transporter ─────────────────────────────────────────────────────────────
// Uses Gmail with App Password (set MAIL_USER + MAIL_PASS in .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

// ─── Verify on startup ───────────────────────────────────────────────────────
transporter.verify((err) => {
  if (err) {
    console.warn('⚠  Email transporter not ready:', err.message)
  } else {
    console.log('✅ Email transporter ready')
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildFieldRows(fields) {
  return fields
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;color:#666;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;color:#1a1a1a;font-size:13px;font-weight:600;">${value || '—'}</td>
        </tr>`
    )
    .join('')
}

function wrapHtml({ title, formLabel, ref, bodyRows, recipientNote }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:28px 32px;text-align:center;">
            <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
              Settle<span style="color:#e8611a;">ezy</span>
            </span>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:1px;text-transform:uppercase;">${formLabel}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 24px;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a2e;">${title}</h2>
            ${ref ? `<p style="margin:0 0 20px;font-size:13px;color:#888;">Reference: <strong style="color:#e8611a;">${ref}</strong></p>` : ''}
            <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.6;">${recipientNote}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
              ${bodyRows}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center;color:#aaa;font-size:11px;">
            © ${new Date().getFullYear()} Settleezy UG (haftungsbeschränkt) · Berlin, Germany<br/>
            <a href="https://www.settleezy.de" style="color:#e8611a;text-decoration:none;">www.settleezy.de</a>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// sendFormEmails — universal sender for all three forms
//
// @param {Object} opts
//   formLabel      : 'Partner Application Form' | 'Enquiry Form' | 'Contact Form'
//   ref            : reference number string
//   recipientEmail : person who filled the form
//   fields         : array of [label, value] pairs
//   adminSubject   : subject line for admin email
//   userSubject    : subject line for user confirmation
// ─────────────────────────────────────────────────────────────────────────────
async function sendFormEmails({ formLabel, ref, recipientEmail, fields, adminSubject, userSubject }) {
  const adminEmail = process.env.MAIL_USER   // admin receives at the same SettleEzy mail

  const bodyRows = buildFieldRows(fields)

  // ── Admin email ───────────────────────────────────────────────────────────
  const adminHtml = wrapHtml({
    title: `New ${formLabel} Submission`,
    formLabel,
    ref,
    bodyRows,
    recipientNote: `A new form has been submitted. All details are listed below.`,
  })

  // ── User confirmation email ───────────────────────────────────────────────
  const userHtml = wrapHtml({
    title: `We received your ${formLabel}!`,
    formLabel,
    ref,
    bodyRows,
    recipientNote: `
      Thank you for reaching out to Settleezy! We have successfully received your submission.
      Our team will review the details below and get back to you within <strong>2–5 business days</strong>.
      Please keep your reference number handy for any follow-up queries.
    `,
  })

  const mailErrors = []

  // Send to admin
  try {
    await transporter.sendMail({
      from: `"Settleezy Forms" <${adminEmail}>`,
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
    })
  } catch (err) {
    console.error('Admin email send error:', err.message)
    mailErrors.push(`admin: ${err.message}`)
  }

  // Send confirmation to user
  if (recipientEmail) {
    try {
      await transporter.sendMail({
        from: `"Settleezy" <${adminEmail}>`,
        to: recipientEmail,
        subject: userSubject,
        html: userHtml,
      })
    } catch (err) {
      console.error('User email send error:', err.message)
      mailErrors.push(`user: ${err.message}`)
    }
  }

  return mailErrors
}

module.exports = { sendFormEmails }
