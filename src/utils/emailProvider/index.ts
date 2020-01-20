const nodemailer = require('nodemailer')
import templates from '../emailTemplates'
import { cyan } from 'chalk'

// Import the email templates
const { welcomeEmail } = templates

const {
  EMAIL_PROVIDER_HOST,
  EMAIL_PROVIDER_PORT,
  EMAIL_PROVIDER_USER,
  EMAIL_PROVIDER_PASS,
  DOMAIN,
  NODE_ENV
} = process.env

const emailTransport = {
  host: EMAIL_PROVIDER_HOST,
  port: EMAIL_PROVIDER_PORT,
  auth: {
    user: EMAIL_PROVIDER_USER,
    pass: EMAIL_PROVIDER_PASS
  }
}

interface emailProvider {
  to: string
  template: 'welcome_email' | ''
  subject: string
  data?: any
}

export default class EmailProvider {
  to: string
  template: 'welcome_email' | ''
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
          hash: this.data.hash
        })
      default:
        throw new Error('Invalid email template')
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
        if (err) reject(err)
        console.log(cyan(JSON.stringify(info)))
        resolve()
      })
    })
  }
}