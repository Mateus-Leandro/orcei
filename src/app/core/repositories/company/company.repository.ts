import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { LoadingService } from '../../services/loading/loading.service';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompanyRepository {
  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
  ) {}

  searchForCnpj(cnpj: string): Observable<any> {
    this.loadingService.show();
    return this.http
      .get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
      .pipe(finalize(() => this.loadingService.hide()));
  }
}
