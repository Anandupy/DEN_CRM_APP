export type AppRole = 'owner' | 'senior_trainer' | 'trainer' | 'member';

export type AppPermission =
  | 'members.view'
  | 'members.create'
  | 'members.update'
  | 'members.delete'
  | 'members.assign_trainer'
  | 'fees.view'
  | 'fees.create'
  | 'fees.collect'
  | 'attendance.view'
  | 'attendance.mark'
  | 'trainers.view'
  | 'trainers.manage'
  | 'reports.view'
  | 'supplements.view'
  | 'supplements.manage'
  | 'salary.view'
  | 'salary.manage'
  | 'notifications.send'
  | 'settings.manage'
  | 'access.manage';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: AppRole;
  is_active: boolean;
}

export interface RoleDefinition {
  key: AppRole;
  label: string;
  homePath: string;
  pathPrefix: string;
  permissions: AppPermission[];
}
