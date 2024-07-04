import { AccountChamgedCourse } from '@nestjs-rabbit-mq/contracs';
import {
  IEvent,
  IUser,
  IUserCourse,
  PurchaseState,
  UserRole,
} from '@nestjs-rabbit-mq/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  _id?: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses?: IUserCourse[];
  events: IEvent[] = [];

  constructor(user: IUser) {
    (this._id = user._id),
      (this.displayName = user.displayName),
      (this.email = user.email),
      (this.passwordHash = user.passwordHash),
      (this.role = user.role);
    this.courses = user.courses;
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public async validatePassword(password: string) {
    return compare(password, this.passwordHash);
  }

  public async updateProfile(displayName: string) {
    this.displayName = displayName;
    return this;
  }

  public async getPublicProfile() {
    return {
      email: this.email,
      displayName: this.displayName,
      role: this.role,
    };
  }

  public updateCourse(courseId: string, state: PurchaseState) {
    const existCourse = this.courses.find((cour) => cour.courseId === courseId);

    if (!existCourse) {
      this.courses.push({ courseId, purchaseState: state });
      return this;
    }

    if (state === PurchaseState.Canceled) {
      this.courses.filter((cour) => cour.courseId !== courseId);
      return this;
    }

    this.courses.map((cour) => {
      if (cour.courseId === courseId) {
        return (cour.purchaseState = state);
      }
      return cour;
    });

    this.events.push({
      topic: AccountChamgedCourse.topic,
      data: { courseId, id: this._id, state },
    });

    return this;
  }

  public getCourseState(courseId: string): PurchaseState {
    return (
      this.courses.find((c) => c.courseId === courseId)?.purchaseState ??
      PurchaseState.Started
    );
  }
}
