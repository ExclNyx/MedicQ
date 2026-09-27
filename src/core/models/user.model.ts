export type UserRole = 'patient' | 'staff' | 'admin';

export interface UserModel {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: Date;
}
