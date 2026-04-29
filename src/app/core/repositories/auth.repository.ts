import { Injectable } from '@angular/core';
import { LoadingService } from '../services/loading/loading.service';
import { SupabaseService } from '../services/supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { from, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private supabase: SupabaseClient;
  constructor(
    private supabaseService: SupabaseService,
    private loadingService: LoadingService,
  ) {
    this.supabase = this.supabaseService.supabase;
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
