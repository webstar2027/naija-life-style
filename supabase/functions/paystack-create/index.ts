import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
Deno.serve(async (req) => {
  try {
    const auth = req.headers.get('Authorization');
    if (!auth) return new Response('Unauthorized', {status:401});
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {global:{headers:{Authorization:auth}}});
    const {data:{user},error:userError}=await supabase.auth.getUser();
    if(userError||!user) return new Response('Unauthorized',{status:401});
    const {pack_naira}=await req.json();
    const packs:Record<number,number>={10000:100000,20000:200000,50000:500000,100000:1000000};
    const realKobo=packs[Number(pack_naira)];
    if(!realKobo) return new Response('Invalid pack',{status:400});
    const secret=Deno.env.get('PAYSTACK_SECRET_KEY');
    if(!secret) return new Response('PAYSTACK_SECRET_KEY is not configured',{status:500});
    const ref=`nl_${crypto.randomUUID().replaceAll('-','')}`;
    const response=await fetch('https://api.paystack.co/transaction/initialize',{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({email:user.email,amount:String(realKobo),currency:'NGN',reference:ref,callback_url:`${Deno.env.get('SITE_URL')}/?payment=complete&reference=${ref}`,metadata:{user_id:user.id,game_naira:Number(pack_naira)}})});
    const data=await response.json();
    if(!response.ok||!data.status) return new Response(JSON.stringify(data),{status:502,headers:{'Content-Type':'application/json'}});
    return new Response(JSON.stringify(data.data),{headers:{'Content-Type':'application/json'}});
  } catch(e) { return new Response(String(e),{status:500}); }
});
