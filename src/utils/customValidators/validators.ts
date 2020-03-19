import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator'
import { roleModel } from '../../models/role'
import { permissionModel } from '../../models/permission';
import { isMongoId } from '../reusableSnippets';
import moment from 'moment'

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
            if (!validIds) { return false }

            // If they are all valid proceed to check that they are all permisssions
            const permissions = await permissionModel.find({ _id: { '$in': ids } }, { _id: 1 })

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

export function IsBefore(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: Date, args: ValidationArguments) {
          try {
            console.log('Esto se esta ejecutando')
            const to = (args.object as any)['to']
            return moment(value).isBefore(to)
          } catch(e) {
            return false
          }
        }
      }
    });
  };
}

export function IsBeforeOrSame(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: Date, args: ValidationArguments) {
          try {
            console.log('Esto se esta ejecutando')
            const to = (args.object as any)['to']
            console.log(value)
            return moment(value).isSameOrBefore(to)
          } catch(e) {
            return false
          }
        }
      }
    });
  };
}

export function IsAfter(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: Date, args: ValidationArguments) {
          try {
            const from = (args.object as any)['from']
            return moment(value).isAfter(from)
          } catch(e) {
            return false
          }
        }
      }
    });
  };
}