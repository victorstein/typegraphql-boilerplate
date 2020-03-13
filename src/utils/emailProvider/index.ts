const nodemailer = require('nodemailer')
import templates from './emailTemplates'
import { cyan } from 'chalk'
import { legibleTime } from '../reusableSnippets'
import Error from '../../middlewares/errorHandler'

// Import the email templates
const { welcomeEmail, passwordReset } = templates

const {
  EMAIL_PROVIDER_HOST,
  EMAIL_PROVIDER_USER,
  EMAIL_PROVIDER_PASS,
  EMAIL_PROVIDER_TLS_PORT,
  EMAIL_PROVIDER_SSL_PORT,
  DOMAIN,
  NODE_ENV,
  EMAIL_VERIFICATION_EXPIRY,
  PASSWORD_RESET_REQUEST_EXPIRY
} = process.env

const emailTransport = {
  host: EMAIL_PROVIDER_HOST,
  port: NODE_ENV === 'production' ? EMAIL_PROVIDER_SSL_PORT : EMAIL_PROVIDER_TLS_PORT,
  auth: {
    user: EMAIL_PROVIDER_USER,
    pass: EMAIL_PROVIDER_PASS
  }
}

interface emailProvider {
  to: string
  template: 'welcome_email' | 'reset_password'
  subject: string
  data?: any
}

export default class EmailProvider {
  to: string
  template: 'welcome_email' | 'reset_password'
  subject: string
  data?: any
  transporter: any

  constructor ({
    to,
    template,
    subject,
    data
  }: emailProvider) {
    this.to = to
    this.template = template
    this.subject = subject
    this.data = data
    this.transporter = nodemailer.createTransport(emailTransport)
  }

  chooseTemplate(template: string) {
    switch (template) {
      case 'welcome_email':
        return welcomeEmail({
          firstName: this.data.firstName,
          lastName: this.data.lastName,
          hash: this.data.hash,
          expiry: legibleTime(EMAIL_VERIFICATION_EXPIRY!)
        })
      case 'reset_password':
        return passwordReset({
          firstName: this.data.firstName,
          lastName: this.data.lastName,
          hash: this.data.hash,
          expiry: legibleTime(PASSWORD_RESET_REQUEST_EXPIRY!)
        })
      default:
        throw new Error('Invalid email template', 500)
    }
  }

  sendEmail (): Promise<void> {
    return new Promise((resolve, reject) => {
      const message = {
        from: `do-not-reply@${DOMAIN}${NODE_ENV === 'production' ? '' : '.com'}`,
        to: this.to,
        subject: this.subject,
        html: this.chooseTemplate(this.template) // Plain text body
      }

      this.transporter.sendMail(message, (err: Error, info: any) => {
        if (err) return reject(err)
        console.log(cyan(JSON.stringify(info)))
        return resolve()
      })
    })
  }
}