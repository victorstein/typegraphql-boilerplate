import { ObjectType } from "type-graphql";
import { prop, modelOptions, getModelForClass } from '@typegoose/typegoose'
import { Field, ID } from 'type-graphql'

@ObjectType()
@modelOptions({ schemaOptions: { timestamps: true } })
export class User {
  @Field(() => ID)
  id: string

  @prop()
  @Field()
  firstName: string

  @prop()
  @Field()
  lastName: string

  @prop({ lowercase: true })
  @Field()
  email: string

  @prop()
  password: string

  @prop({ default: 'user' })
  @Field()
  role: string

  @prop({ default: 1 })
  tokenVersion: number

  @prop({ default: false })
  @Field()
  verified: boolean
}

export const userModel = getModelForClass(User)