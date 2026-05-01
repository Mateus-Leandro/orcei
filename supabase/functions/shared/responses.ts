const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const success = (body: any) =>
  new Response(JSON.stringify({ data: body }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

export const fail = (msg: string, status = 400) => {
  console.error(`Erro: ${msg}`);
  return new Response(JSON.stringify({ message: msg }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

export const handleCORS = () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};
