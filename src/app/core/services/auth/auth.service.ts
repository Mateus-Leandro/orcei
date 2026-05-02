import { Injectable } from '@angular/core';
import { AuthRepository } from '../../repositories/auth/auth.repository';
import { ICreateUser } from '../../models/user/user.model';
import { ICreateUsercompany } from '../../models/company/company.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private repository: AuthRepository) {}

  getSession() {
    return this.repository.getSession();
  }

  createAccount(createUser: ICreateUser) {
    return this.repository.createAccount(createUser);
  }

  logIn(email: string, password: string) {
    return this.repository.logIn(email, password);
  }

  logOut() {
    return this.repository.logOut();
  }
}
