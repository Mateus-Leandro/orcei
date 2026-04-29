import { Injectable } from '@angular/core';
import { AuthRepository } from '../../repositories/auth.repository';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private repository: AuthRepository) {}

  getSession() {
    return this.repository.getSession();
  }
}
