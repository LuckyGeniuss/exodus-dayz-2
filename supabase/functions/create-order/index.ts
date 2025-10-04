import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { items, payment_method, total_amount, discount_amount, final_amount } = await req.json();

    console.log('Creating order for user:', user.id);

    // Get user profile to check balance if paying with balance
    if (payment_method === 'balance') {
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile || profile.balance < final_amount) {
        throw new Error('Insufficient balance');
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount,
        discount_amount,
        final_amount,
        payment_method,
        payment_status: payment_method === 'balance' ? 'completed' : 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    console.log('Order created:', order.id);

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    console.log('Order items created');

    // If paying with balance, deduct from user balance and create transaction
    if (payment_method === 'balance') {
      const { error: balanceError } = await supabaseClient.rpc('deduct_balance', {
        user_id: user.id,
        amount: final_amount,
      });

      if (balanceError) {
        console.error('Balance deduction error:', balanceError);
        throw balanceError;
      }

      // Create transaction record
      const { error: transactionError } = await supabaseClient
        .from('balance_transactions')
        .insert({
          user_id: user.id,
          amount: -final_amount,
          type: 'purchase',
          status: 'completed',
          description: `Order #${order.id.slice(0, 8)}`,
        });

      if (transactionError) {
        console.error('Transaction creation error:', transactionError);
      }

      console.log('Balance deducted and transaction created');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: order.id,
        payment_status: order.payment_status,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
