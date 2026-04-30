import { Injectable } from '@angular/core';
import { LoadingService } from '../services/loading/loading.service';
import { SupabaseService } from '../services/supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { finalize, from, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private supabase: SupabaseClient;
  constructor(
    private supabaseService: SupabaseService,
    private loadingService: LoadingService,
  ) {
    this.supabase = this.supabaseService.supabase;
  }

  createAccount(email: string, password: string, name: string) {
    this.loadingService.show();

    return from(
      this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      }),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
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
