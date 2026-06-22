import { Injectable } from '@angular/core';

import { UserRepository } from '../../repositories/user/user.repository';
import { ICreateCompanyUser, IUpdateCompanyUser } from '../../models/user/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private repository: UserRepository) {}

  findAll(page: number, limit: number, search: string) {
    return this.repository.findAll(page, limit, search);
  }

  findById(id: string) {
    return this.repository.findById(id);
  }

  create(user: ICreateCompanyUser) {
    return this.repository.create(user);
  }

  update(user: IUpdateCompanyUser) {
    return this.repository.update(user);
  }

  getCurrentUserId() {
    return this.repository.getCurrentUserId();
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.repository.changePassword(currentPassword, newPassword);
  }
}
