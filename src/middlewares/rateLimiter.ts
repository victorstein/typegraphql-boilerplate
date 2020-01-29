import { createMethodDecorator } from "type-graphql";
import { ipModel } from "../models/ip";
import Error from '../middlewares/errorHandler'

export default function LimitRate(offenseName:string, offenseLimit:number) {
  return createMethodDecorator(async ({ context }, next) => {
    const ctx: any = context

    // Get the users ip
    const { req: { ip } } = ctx

    // Locate the users offense and ip
    const offense = await ipModel.findOne({ ip, offense: offenseName })

    // If theres no offense create a new offense
    if (!offense) {
      await ipModel.create({ ip, offense: offenseName, times: 1 })
      return next()
    }

    // Check if we have exceeded the offense limit
    if (offense.times >= offenseLimit) {
      throw new Error('Unable to process your request. Try again later', 429)
    }

    // If theres a registered offense incremet the offense iteration
    offense.set({
      times: offense.times + 1
    })

    // save the offense
    await offense.save()

    // Search if the user has an offense
    return next();
  });
}