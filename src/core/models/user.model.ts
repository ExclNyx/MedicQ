export type UserRole = 'patient' | 'staff' | 'admin';

/** Reject malformed Firestore roles instead of routing users between role layouts. */
export function isUserRole(value: unknown): value is UserRole {
  return value === 'patient' || value === 'staff' || value === 'admin';
}

export interface UserModel {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: Date;
}
