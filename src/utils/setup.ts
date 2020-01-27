import { roleModel } from "../models/role"
import { mongoose } from "@typegoose/typegoose"
import { permissionModel } from "../models/permission"
import { blue, greenBright, red } from 'chalk'

export default async (): Promise<void> => {
  try {
    const baseRoles = ['adminRole', 'baseRole']
    console.log(blue('Checking if the base roles exist...'))
    // Check if the adminRole and base role exist
    let defaultRoles = await roleModel.find({ usedFor: { $in: baseRoles } }, { id: 0 })

    // Create the default roles if they dont exist
    if (!defaultRoles.length) {
      console.log(red('Base roles not created yet. proceeding to create base roles.'))
      console.log(greenBright(baseRoles.toString().replace(/,/g, '\n')))
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
    } else {
      console.log(greenBright('Base roles already created. No new roles created.'))
    }

    // Get the admin role
    const adminRole = defaultRoles.find(u => u.usedFor === 'adminRole')

    console.log(blue('Checking if any new permissions are needed...'))
    // Get the permissions of all the models
    const permissions: string[] = Object.keys(mongoose.models).reduce((x: string[], u) => {
      u = u.toLowerCase()
      x.push(`create_${u}s`)
      x.push(`read_${u}s`)
      x.push(`read_all_${u}s`)
      x.push(`update_${u}s`)
      x.push(`delete_${u}s`)
      return x
    }, [])

    // Check if all the default permissions exist
    let existingPermissions = await permissionModel.aggregate([
      { $match: { name: { $in: permissions } } },
      { $project: { name: 1, _id: 0 } }
    ])

    // Transform it to string array for ease of use
    existingPermissions = existingPermissions.map(({ name }) => name)

    // Check existing permissions against all models permissions
    const newPermissions = permissions.filter(u => {
      return !existingPermissions.includes(u)
    })

    // Create missing roles
    if (newPermissions.length) {
      console.log(red('New permissions need to be created! Creating the following permissions and adding them to the adminRole: '))
      console.log(greenBright(newPermissions.toString().replace(/,/g, '\n')))

      await permissionModel.create(
        newPermissions.map(u => ({
            name: u,
            usedByRole: mongoose.Types.ObjectId(adminRole!._id)
        })
      ))
      console.log(blue('Done! starting the server.'))
    } else {
      console.log(greenBright('No extra permissions created, everything is up to date.'))
    }
  } catch (e) {
    console.log(e)
    throw new Error(e)
  }
}