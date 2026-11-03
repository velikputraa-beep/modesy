'use client';
import { hasPermission } from '@/lib/permissions';

export function PermissionGate({ user, permission, children, fallback = null }) {
  if (!hasPermission(user, permission)) return fallback;
  return children;
}
