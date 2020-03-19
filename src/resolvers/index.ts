import UserResolvers from './userResolvers'
import RoleResolvers from './roleResolvers'
import PermissionResolvers from './PermissionResolvers'
import AuthorizationResolvers from './globalResolvers/authorizationResolvers'

export default [
  UserResolvers,
  RoleResolvers,
  PermissionResolvers,
  AuthorizationResolvers
]
