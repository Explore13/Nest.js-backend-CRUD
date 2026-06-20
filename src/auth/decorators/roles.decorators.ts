// unique identifiers for storing and retriving role requirements as metadata on route handlers

import { SetMetadata } from '@nestjs/common';
import { Role } from '../users.entity';

// -> roles decorator markes the routes with the roles that are allowed to access them
// -> roles guard will later reads this metadata to check if the user has pxermission
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
