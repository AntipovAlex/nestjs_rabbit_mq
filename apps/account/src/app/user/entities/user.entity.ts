import { IUser, IUserCourse, UserRole } from '@nestjs-rabbit-mq/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
  _id?: string;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses?: IUserCourse[];

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
}
