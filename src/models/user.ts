import { ObjectType } from "type-graphql";
import { prop, Ref, arrayProp, pre, post, plugin, modelOptions, getModelForClass } from '@typegoose/typegoose'
import { Field, ID } from 'type-graphql'
import { Role, roleModel } from "./role";
import { Permission } from "./permission";
import bcrypt from 'bcryptjs'
import mongoose from "mongoose";
import EmailProvider from "../utils/emailProvider";
import jwt from 'jsonwebtoken'
import paginate from '../utils/reusableSnippets/pagination'
import { Base } from './base'
import Error from '../middlewares/errorHandler'

const { GLOBAL_SECRET, EMAIL_VERIFICATION_EXPIRY } = process.env

@pre<User>('save', async function (next): Promise<void> {
  if (this.isNew) {
    // Keep the is new data for post hook
    this.wasNew = this.isNew

    // Hash the password before saving
    this.password = await bcrypt.hash(this.password, 12)
    
    // Get the admin and base role
    const adminRole = await roleModel.findOne({ usedFor: 'adminRole' }, { id: 1 })
    const baseRole = await roleModel.findOne({ usedFor: 'baseRole' }, { id: 1 })

    // Assign the admin role if is the first user on the DB
    if (await userModel.estimatedDocumentCount() > 0) {
      this.role = mongoose.Types.ObjectId(baseRole!._id)
    } else {
      this.role = mongoose.Types.ObjectId(adminRole!._id)
    }
  }

  next()
})

@post<User>('save', async function ({ _id, firstName, lastName, email, wasNew }, next): Promise<void> {
  try {
    if (wasNew) {
      // Create a hash to auth the user
      const hash = jwt.sign({ id: _id }, GLOBAL_SECRET!, { expiresIn: EMAIL_VERIFICATION_EXPIRY })

      // Once the new user is created proceed to send welcome email
      const emailProvider = new EmailProvider({
        to: email,
        subject: 'Verify your account',
        template: "welcome_email",
        data: {
          firstName: firstName,
          lastName: lastName,
          hash
        }
      })

      // Send the email
      await emailProvider.sendEmail()
    }

    next!()
  } catch(e) {
    throw new Error(e)
  }
})

@ObjectType()
@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(paginate)
export class User extends Base {
  @Field(() => ID)
  id: string

  // Used to overcome limitiations in post hook https://github.com/Automattic/mongoose/issues/2162
  wasNew: boolean

  @prop({ required: true, index: true, text: true })
  @Field({ nullable: false })
  firstName: string

  @prop({ required: true })
  @Field({ nullable: false })
  lastName: string

  @prop({ lowercase: true, required: true })
  @Field({ nullable: false })
  email: string

  @prop({ required: true })
  password: string

  @prop({ ref: Role })
  @Field(() => Role, { nullable: false })
  role: Ref<Role>

  @arrayProp({ itemsRef: 'Permission' })
  @Field(() => [Permission], { nullable: true })
  permissions: Ref<Permission>[]

  @prop({ default: 1 })
  tokenVersion: number

  @prop({ default: 1 })
  passwordRecoveryVersion: number

  @prop({ default: false })
  @Field()
  verified: boolean
}

export const userModel = getModelForClass(User)
