import {
  registerDecorator,
  ValidationOptions
} from 'class-validator'
import { roleModel } from '../../models/role'
import { permissionModel } from '../../models/permission';
import { isMongoId } from '../reusableSnippets';

export function areMongoIds(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(ids: string[]) {
          try {
            // If there are no Ids to validate fail the validation
            if (!ids.length) { return true }
            
            // Ensure that they are all valid mongo Ids
            let validIds = ids.every(u => isMongoId(u))

            // Return the validation results
            return validIds
          } catch(e) {
            return false
          }
        }
      }
    });
  };
}

export function areValidPermissions(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        async validate(ids: string[]) {
          try {
            // If no permissions provided pass the validation
            if (!ids.length) { return true }

            // Make sure they are all valid mongo IDs
            let validIds = ids.every(u => isMongoId(u))

            // If invalid mongo ID then return error
            if (!validIds) { return validIds }

            // If they are all valid proceed to check that they are all permisssions
            const permissions = await permissionModel.find({ _id: { '$in': validIds } }, { _id: 1 })

            // If not all permissions found, fail the validation
            if (permissions.length !== ids.length) { return false }

            // If all permissions found pass the validation
            return true
          } catch(e) {
            return false
          }
        }
      }
    });
  };
}

type models = 'role' | 'permission'

export function nameNotTaken(model: models, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        async validate(name: string) {
          try {
            let data
            switch (model) {
              case 'role':
                // Find any role with that name
                data = await roleModel.find({ name })
                break
              case 'permission':
                // Find any permission with that name
                data = await permissionModel.find({ name })
                break
              default:
                return false
            }

            // pass or fail the alidation based on the result
            return !Boolean(data.length)
          } catch(e) {
            return false
          }
        }
      }
    });
  };
}