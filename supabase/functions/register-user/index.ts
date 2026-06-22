// Cadastra um novo usuário vinculado à empresa do usuário autenticado que faz a requisição.
// Baseado em ../register/index.ts, mas a empresa é derivada do JWT do solicitante
// (não recebida no corpo), garantindo o vínculo com a empresa logada.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { success, fail, handleCORS } from '../shared/responses.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { user } = await req.json();

    if (!user?.email || !user?.password) {
      return fail('Dados incompletos. Verifique e-mail e senha do usuário.');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return fail('Requisição não autenticada.', 401);
    }

    // O token do usuário precisa ser passado explicitamente ao getUser; sem ele
    // o cliente tenta usar uma sessão local (inexistente no edge runtime).
    const token = authHeader.replace(/^Bearer\s+/i, '');

    // Cliente no contexto do solicitante: usado apenas para identificá-lo e
    // descobrir a empresa à qual o novo usuário será vinculado.
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser(token);

    if (callerError || !caller) {
      return fail('Sessão inválida ou expirada.', 401);
    }

    const companyId = caller.app_metadata?.company_id as string | undefined;
    if (!companyId) {
      return fail('Usuário autenticado não está vinculado a nenhuma empresa.', 400);
    }

    // Cliente administrativo (service role) para criar o usuário no Auth.
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { name: user.name },
      app_metadata: { company_id: companyId },
    });

    if (authError) {
      const msg = authError.message.includes('already been registered')
        ? 'E-mail em uso.'
        : authError.message;
      return fail(msg, 400);
    }

    const createdUserId = authUser.user.id;

    // O perfil em public.users é criado pelo trigger on_auth_user_created;
    // aqui garantimos nome e o vínculo com a empresa do solicitante.
    const { error: userUpdateError } = await admin
      .from('users')
      .update({
        name: user.name,
        company_id: companyId,
      })
      .eq('id', createdUserId);

    if (userUpdateError) {
      await admin.auth.admin.deleteUser(createdUserId);
      return fail('Erro ao vincular perfil: ' + userUpdateError.message, 500);
    }

    return success({
      message: 'Usuário cadastrado com sucesso',
      user_id: createdUserId,
      company_id: companyId,
    });
  } catch (error) {
    return fail(
      'Erro inesperado: ' + (error instanceof Error ? error.message : 'Erro interno'),
      500,
    );
  }
});
