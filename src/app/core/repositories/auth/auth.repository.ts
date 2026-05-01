import { Injectable } from '@angular/core';
import { LoadingService } from '../../services/loading/loading.service';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { catchError, finalize, from, map, throwError } from 'rxjs';
import { ICreateUser } from '../../models/user/user.model';

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private supabase: SupabaseClient;
  constructor(
    private supabaseService: SupabaseService,
    private loadingService: LoadingService,
  ) {
    this.supabase = this.supabaseService.supabase;
  }

  createAccount(createUser: ICreateUser) {
    this.loadingService.show();

    return from(
      this.supabase.functions.invoke('register', {
        body: {
          user: {
            name: createUser.name,
            email: createUser.email,
            password: createUser.pass,
          },
          company: createUser.company,
        },
      }),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
      catchError((error) => {
        if (error?.context) {
          return from(error.context.json()).pipe(
            map((body: any) => {
              throw new Error(body.message || 'Erro ao criar conta.');
            }),
          );
        }

        return throwError(() => new Error(error.message || 'Erro ao criar conta.'));
      }),
      finalize(() => this.loadingService.hide()),
    );
  }

  getSession() {
    return from(this.supabase.auth.getSession()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data.session;
      }),
    );
  }
}
