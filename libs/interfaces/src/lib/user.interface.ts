export interface IUser {
  _id?: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export enum UserRole {
  Teacher = 'Teacher',
  Student = 'Student',
}
