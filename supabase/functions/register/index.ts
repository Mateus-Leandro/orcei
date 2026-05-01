// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { success, fail, handleCORS } from '../shared/responses.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { company, user } = await req.json();

    if (!company?.cnpj || !user?.email || !user?.password) {
      return fail('Dados incompletos. Verifique empresa (cnpj) e usuário (email/senha).');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: companyExists, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('cnpj', company.cnpj)
      .maybeSingle();

    if (companyError) return fail('Erro ao validar empresa: ' + companyError.message, 500);
    if (companyExists) return fail('Já existe uma empresa cadastrada com este CNPJ.');

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { name: user.name },
    });

    if (authError) {
      const msg = authError.message.includes('already been registered')
        ? 'E-mail em uso.'
        : authError.message;
      return fail(msg, 400);
    }

    const createdUserId = authUser.user.id;

    const { data: createdCompany, error: companyCreateError } = await supabase
      .from('companies')
      .insert({
        name: company.name,
        cnpj: company.cnpj,
      })
      .select()
      .single();

    if (companyCreateError) {
      await supabase.auth.admin.deleteUser(createdUserId);
      return fail('Erro ao criar empresa: ' + companyCreateError.message, 500);
    }

    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        name: user.name,
        company_id: createdCompany.id,
      })
      .eq('id', createdUserId);

    if (userUpdateError) return fail('Erro ao vincular perfil: ' + userUpdateError.message, 500);

    await supabase.auth.admin.updateUserById(createdUserId, {
      app_metadata: { company_id: createdCompany.id },
    });

    return success({
      message: 'Registro concluído com sucesso',
      company_id: createdCompany.id,
      user_id: createdUserId,
    });
  } catch (error) {
    return fail(
      'Erro inesperado: ' + (error instanceof Error ? error.message : 'Erro interno'),
      500,
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/register' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
