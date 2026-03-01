import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { amount } = await req.json();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) throw new Error("Invalid amount");

    // Record transaction
    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: user.id,
      type: "top_up",
      amount: numAmount,
      description: `Wallet top-up $${numAmount}`,
      status: "completed",
    });

    // Upsert balance
    const { data: existing } = await supabaseAdmin
      .from("wallet_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      await supabaseAdmin
        .from("wallet_balances")
        .update({ balance: existing.balance + numAmount, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    } else {
      await supabaseAdmin
        .from("wallet_balances")
        .insert({ user_id: user.id, balance: numAmount });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
