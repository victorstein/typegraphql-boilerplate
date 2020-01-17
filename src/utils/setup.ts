import { roleModel } from "../models/role"

export default async (): Promise<void> => {
  try {
    // Check if the adminRole and base role exist
    let defaultRoles = await roleModel.find({ usedFor: { '$in': ['adminRole', 'baseRole'] } }, { id: 0 })

    // Create the default roles if they dont exist
    if (!defaultRoles.length) {
      defaultRoles = await roleModel.create([
        {
          name: 'Admin',
          usedFor: 'adminRole'
        },
        {
          name: 'User',
          usedFor: 'baseRole'
        },
      ])
    }
  } catch (e) {
    console.log(e)
    throw new Error(e)
  }
}