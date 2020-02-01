import { roleModel } from "../models/role"
import { mongoose } from "@typegoose/typegoose"
import { permissionModel } from "../models/permission"
import { blue, greenBright, red } from 'chalk'
import Error from '../middlewares/errorHandler'

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

    console.log(blue('Checking if any new permissions are needed...'))
    // Get the permissions of all the models
    const permissions: string[] = Object.keys(mongoose.models).reduce((x: string[], u) => {
      u = u.toLowerCase()
      x.push(`create_${u}s`)
      x.push(`read_all_${u}s`)
      x.push(`update_all_${u}s`)
      x.push(`delete_all_${u}s`)
      return x
    }, [])

    // Create basic permissions for owned content
    const basePermissions = [
      'update_owned',
      'read_owned',
      'delete_owned'
    ]

    // Check if all the default permissions exist
    let existingPermissions = await permissionModel.aggregate([
      { $match: { name: { $in: permissions } } },
      { $project: { name: 1, _id: 0 } }
    ])

    let existingBasePermissions = await permissionModel.aggregate([
      { $match: { name: { $in: basePermissions } } },
      { $project: { name: 1, _id: 0 } }
    ])

    // Transform it to string array for ease of use
    existingPermissions = existingPermissions.map(({ name }) => name)
    existingBasePermissions = existingBasePermissions.map(({ name }) => name)

    // Check existing permissions against all models permissions
    const newPermissions = permissions.filter(u => {
      return !existingPermissions.includes(u)
    })

    const newBasePermissions = basePermissions.filter(u => {
      return !existingBasePermissions.includes(u)
    })

    // Create missing roles into admin role
    if (newPermissions.length) {
      console.log(red('New permissions need to be created! Creating the following permissions and adding them to the adminRole: '))
      console.log(greenBright(newPermissions.toString().replace(/,/g, '\n')))

      const permissions = await permissionModel.create(
        newPermissions.map(u => ({
            name: u
        })
      ))

      // Once all the permissions were created add them to the adminRole
      await roleModel
        .findOneAndUpdate(
          { usedFor: 'adminRole' },
          { $push: { permissions: [...permissions] } }
        )
    }
    
    // Create missing roles into base role
    if (newBasePermissions.length) {
      console.log(red('New Base permissions need to be created! Creating the following permissions and adding them to the baseRole: '))
      console.log(greenBright(newBasePermissions.toString().replace(/,/g, '\n')))

      const basePermissions = await permissionModel.create(
        newBasePermissions.map(u => ({
            name: u
        })
      ))

      // Add the base permission to the base
      await roleModel
      .findOneAndUpdate(
        { usedFor: 'baseRole' },
        { $push: { permissions: [...basePermissions] } }
      )

      // Once all the permissions were created add them to the adminRole
      await roleModel
      .findOneAndUpdate(
        { usedFor: 'adminRole' },
        { $push: { permissions: [...basePermissions] } }
      )
    }
   
    console.log(blue('Done! starting the server.'))
  } catch (e) {
    throw new Error(e)
  }
}