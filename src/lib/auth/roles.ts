import type { AppPermission, AppRole, RoleDefinition } from './types';

const allPermissions: AppPermission[] = [
  'members.view',
  'members.create',
  'members.update',
  'members.delete',
  'members.assign_trainer',
  'fees.view',
  'fees.create',
  'fees.collect',
  'attendance.view',
  'attendance.mark',
  'trainers.view',
  'trainers.manage',
  'reports.view',
  'supplements.view',
  'supplements.manage',
  'salary.view',
  'salary.manage',
  'notifications.send',
  'settings.manage',
  'access.manage',
];

export const roleDefinitions: Record<AppRole, RoleDefinition> = {
  owner: {
    key: 'owner',
    label: 'Owner',
    homePath: '/owner/dashboard',
    pathPrefix: '/owner',
    permissions: allPermissions,
  },
  senior_trainer: {
    key: 'senior_trainer',
    label: 'Senior Trainer',
    homePath: '/senior/dashboard',
    pathPrefix: '/senior',
    permissions: [
      'members.view',
      'members.create',
      'members.update',
      'members.assign_trainer',
      'fees.view',
      'fees.create',
      'fees.collect',
      'attendance.view',
      'attendance.mark',
      'trainers.view',
      'reports.view',
      'supplements.view',
      'salary.view',
      'notifications.send',
    ],
  },
  trainer: {
    key: 'trainer',
    label: 'Trainer',
    homePath: '/trainer/dashboard',
    pathPrefix: '/trainer',
    permissions: [
      'members.view',
      'fees.view',
      'fees.create',
      'attendance.view',
      'attendance.mark',
      'reports.view',
      'salary.view',
    ],
  },
  member: {
    key: 'member',
    label: 'Member',
    homePath: '/member/dashboard',
    pathPrefix: '/member',
    permissions: [
      'members.view',
      'fees.view',
      'attendance.view',
    ],
  },
};

const legacyRouteAliases: Record<string, string> = {
  '/owner-admin-dashboard': '/owner/dashboard',
  '/member-management': '/owner/members',
  '/fees-management': '/owner/fees',
  '/attendance': '/owner/attendance',
  '/trainers': '/owner/trainers',
  '/reports': '/owner/reports',
  '/settings': '/owner/settings',
  '/notifications': '/owner/notifications',
  '/access-control': '/owner/access-control',
  '/trainer-dashboard': '/trainer/dashboard',
  '/trainer-members': '/trainer/members',
  '/trainer-attendance': '/trainer/attendance',
  '/trainer-fees': '/trainer/fees',
  '/member-dashboard': '/member/dashboard',
  '/member-profile': '/member/profile',
  '/member-attendance': '/member/attendance',
  '/member-fees': '/member/payments',
  '/sign-up-login-screen': '/sign-in',
};

export function getLegacyRedirect(pathname: string) {
  return legacyRouteAliases[pathname] ?? null;
}

export function getHomeRouteForRole(role: AppRole) {
  return roleDefinitions[role]?.homePath ?? '/sign-in';
}

export function normalizeRole(input: string | null | undefined): AppRole {
  switch ((input ?? '').toLowerCase()) {
    case 'owner':
      return 'owner';
    case 'senior trainer':
    case 'senior_trainer':
    case 'senior-trainer':
      return 'senior_trainer';
    case 'trainer':
      return 'trainer';
    default:
      return 'member';
  }
}

export function formatRoleLabel(role: AppRole) {
  return roleDefinitions[role]?.label ?? role;
}

export function hasPermission(role: AppRole, permission: AppPermission) {
  return roleDefinitions[role]?.permissions.includes(permission) ?? false;
}

export function canAccessRoute(role: AppRole, pathname: string) {
  const normalizedPath = getLegacyRedirect(pathname) ?? pathname;
  const definition = roleDefinitions[role];

  if (!definition) return false;
  if (normalizedPath === '/sign-in') return true;

  return normalizedPath === definition.homePath || normalizedPath.startsWith(`${definition.pathPrefix}/`);
}

export function isProtectedAppRoute(pathname: string) {
  return ['/owner', '/senior', '/trainer', '/member'].some((prefix) => pathname.startsWith(prefix));
}
