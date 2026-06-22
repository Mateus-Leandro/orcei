// Lê e atualiza usuários da empresa do solicitante.
// - action 'get':    retorna { id, name, email } para preencher o formulário.
// - action 'update': altera nome (auth + public.users) e e-mail (auth).
// O e-mail vive em auth.users, por isso depende do service_role.
// Em ambos os casos valida que o usuário-alvo pertence à empresa do solicitante.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { success, fail, handleCORS } from '../shared/responses.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const body = await req.json();
    const { action, id } = body;

    if (!id) {
      return fail('ID do usuário não informado.');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return fail('Requisição não autenticada.', 401);
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');

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

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Garante que o usuário-alvo existe e pertence à mesma empresa do solicitante.
    const { data: target, error: targetError } = await admin
      .from('users')
      .select('id, name, company_id')
      .eq('id', id)
      .maybeSingle();

    if (targetError) {
      return fail('Erro ao validar usuário: ' + targetError.message, 500);
    }
    if (!target || target.company_id !== companyId) {
      return fail('Usuário não encontrado nesta empresa.', 404);
    }

    if (action === 'get') {
      const { data: authData, error: authError } = await admin.auth.admin.getUserById(id);
      if (authError) {
        return fail('Erro ao obter usuário: ' + authError.message, 500);
      }
      return success({
        id,
        name: target.name,
        email: authData.user?.email ?? '',
      });
    }

    if (action === 'update') {
      const { name, email } = body;
      if (!name || !email) {
        return fail('Informe nome e e-mail.');
      }

      const { error: authUpdateError } = await admin.auth.admin.updateUserById(id, {
        email,
        user_metadata: { name },
      });

      if (authUpdateError) {
        const msg = authUpdateError.message.includes('already been registered')
          ? 'E-mail em uso.'
          : authUpdateError.message;
        return fail(msg, 400);
      }

      const { error: profileError } = await admin.from('users').update({ name }).eq('id', id);
      if (profileError) {
        return fail('Erro ao atualizar perfil: ' + profileError.message, 500);
      }

      return success({ message: 'Usuário atualizado com sucesso', id });
    }

    return fail('Ação inválida.');
  } catch (error) {
    return fail(
      'Erro inesperado: ' + (error instanceof Error ? error.message : 'Erro interno'),
      500,
    );
  }
});
