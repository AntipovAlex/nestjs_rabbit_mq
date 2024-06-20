export interface IUser {
  _id?: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses?: IUserCourse[];
}

export enum UserRole {
  Teacher = 'Teacher',
  Student = 'Student',
}

export interface IUserCourse {
  courseId: string;
  purchaseState: PurchaseState;
}

export enum PurchaseState {
  Started = 'Started',
  Canceled = 'Canceled',
  WaitingFromPayment = 'WaitingFromPayment',
  Purchased = 'Purchased',
}
