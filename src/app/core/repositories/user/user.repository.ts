import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { catchError, finalize, from, map, switchMap, throwError } from 'rxjs';

import { LoadingService } from '../../services/loading/loading.service';
import { SupabaseService } from '../../services/supabase/supabase.service';
import {
  ICreateCompanyUser,
  IUpdateCompanyUser,
  IUserDetail,
  IUserView,
} from '../../models/user/user.model';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private supabase: SupabaseClient;

  constructor(
    private supabaseService: SupabaseService,
    private loadingService: LoadingService,
  ) {
    this.supabase = this.supabaseService.supabase;
  }

  // A empresa é derivada no backend a partir do token do usuário logado
  // (enviado automaticamente pelo functions.invoke), garantindo o vínculo.
  create(user: ICreateCompanyUser) {
    return this.invokeFunction('register-user', { user }, 'Erro ao cadastrar usuário.');
  }

  findById(id: string) {
    return this.invokeFunction<IUserDetail>(
      'manage-user',
      { action: 'get', id },
      'Erro ao obter usuário.',
    );
  }

  update(user: IUpdateCompanyUser) {
    return this.invokeFunction(
      'manage-user',
      { action: 'update', id: user.id, name: user.name, email: user.email },
      'Erro ao atualizar usuário.',
    );
  }

  // Id do usuário autenticado — usado para liberar a troca de senha apenas no
  // próprio cadastro.
  getCurrentUserId() {
    return from(this.supabase.auth.getUser()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data.user?.id ?? null;
      }),
    );
  }

  // Confirma a senha atual reautenticando o usuário e, em seguida, define a
  // nova senha. A confirmação garante que só o próprio usuário troque a senha.
  changePassword(currentPassword: string, newPassword: string) {
    this.loadingService.show();

    const request = (async () => {
      const { data: userData, error: getError } = await this.supabase.auth.getUser();
      const email = userData.user?.email;
      if (getError || !email) {
        throw new Error('Sessão inválida ou expirada.');
      }

      const { error: signInError } = await this.supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        throw new Error('Senha atual incorreta.');
      }

      const { error: updateError } = await this.supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        throw new Error(updateError.message);
      }

      return true;
    })();

    return from(request).pipe(finalize(() => this.loadingService.hide()));
  }

  // Invoca uma edge function tratando o erro estruturado retornado por ela.
  private invokeFunction<T = unknown>(
    name: string,
    body: Record<string, unknown>,
    defaultError: string,
  ) {
    this.loadingService.show();

    return from(this.supabase.functions.invoke(name, { body })).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        // success() empacota o payload em { data: ... }; devolvemos só o payload.
        return (data?.data ?? data) as T;
      }),
      catchError((error) => {
        if (error?.context) {
          return from(error.context.json()).pipe(
            map((parsed: any) => {
              throw new Error(parsed.message || defaultError);
            }),
          );
        }

        return throwError(() => new Error(error.message || defaultError));
      }),
      finalize(() => this.loadingService.hide()),
    );
  }

  // A tabela users tem RLS de leitura aberta; por isso filtramos explicitamente
  // pela empresa do usuário autenticado para listar apenas os usuários dela.
  findAll(page: number = 1, limit: number = 10, search: string = '') {
    this.loadingService.show();

    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    const request = from(this.supabase.auth.getUser()).pipe(
      switchMap(({ data, error }) => {
        if (error) throw error;

        const companyId = data.user?.app_metadata?.['company_id'];
        if (!companyId) {
          throw new Error('Usuário autenticado não está vinculado a nenhuma empresa.');
        }

        let query = this.supabase
          .from('users')
          .select('*', { count: 'exact' })
          .eq('company_id', companyId)
          .order('name', { ascending: true })
          .range(fromIndex, toIndex);

        if (search?.trim()) {
          query = query.ilike('name', `%${search.trim()}%`);
        }

        return from(query);
      }),
      map(({ data, count, error }) => {
        if (error) throw error;

        const mappedData: IUserView[] = (data || []).map(
          (item): IUserView => ({
            id: item.id,
            name: item.name,
            companyId: item.company_id,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }),
        );

        return {
          data: mappedData,
          count: count ?? 0,
        };
      }),
    );

    return request.pipe(finalize(() => this.loadingService.hide()));
  }
}
