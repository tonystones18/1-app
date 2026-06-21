import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const PERMISSION_KEY = 'permission';
export interface RequiredPermission {
  resource: string;
  action: string;
}
export const RequirePermission = (permission: RequiredPermission) =>
  SetMetadata(PERMISSION_KEY, permission);
