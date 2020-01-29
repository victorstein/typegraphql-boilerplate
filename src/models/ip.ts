import { prop, modelOptions, getModelForClass } from "@typegoose/typegoose";

const { OFFENSE_EXPIRY } = process.env

@modelOptions({ schemaOptions: { timestamps: true }})
export class Ip {
  @prop({ required: true, index: true })
  ip: string

  @prop({ required: true, lowercase: true })
  offense: string

  @prop({ default: 0 })
  times: number

  @prop({ expires: OFFENSE_EXPIRY })
  createdAt: Date
}

export const ipModel = getModelForClass(Ip)