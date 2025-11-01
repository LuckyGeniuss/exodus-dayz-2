import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  userId: string;
}

interface NOWPaymentsCallback {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  outcome_amount: number;
  outcome_currency: string;
  [key: string]: any;
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const apiKey = Deno.env.get('NOWPAYMENTS_API_KEY')!;

    const url = new URL(req.url);
    const path = url.pathname;

    // Handle payment callback from NOWPayments
    if (path.includes('/callback') && req.method === 'POST') {
      const callback: NOWPaymentsCallback = await req.json();
      
      console.log('NOWPayments callback received:', callback);

      // Extract user_id from order_id (format: "deposit_userId_timestamp")
      const orderParts = callback.order_id.split('_');
      if (orderParts.length !== 3 || orderParts[0] !== 'deposit') {
        console.error('Invalid order ID format');
        return new Response(
          JSON.stringify({ error: 'Invalid order ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const userId = orderParts[1];
      const amountUAH = callback.price_amount;

      // Check payment status
      if (callback.payment_status === 'finished') {
        // Get current balance
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const currentBalance = Number(profile.balance) || 0;
        const newBalance = currentBalance + amountUAH;

        // Update user balance
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', userId);

        if (balanceError) {
          console.error('Error updating balance:', balanceError);
          return new Response(
            JSON.stringify({ error: 'Failed to update balance' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create transaction record
        const { error: transactionError } = await supabase
          .from('balance_transactions')
          .insert({
            user_id: userId,
            amount: amountUAH,
            type: 'deposit',
            status: 'completed',
            payment_method: 'usdt',
            description: `Поповнення через USDT (${callback.pay_amount} ${callback.pay_currency})`,
          });

        if (transactionError) {
          console.error('Error creating transaction:', transactionError);
        }

        console.log('Payment processed successfully for user:', userId);
        
        return new Response(
          JSON.stringify({ status: 'ok' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (callback.payment_status === 'failed' || callback.payment_status === 'expired') {
        console.log('Payment failed or expired:', callback.payment_status);
        
        // Create failed transaction record
        await supabase
          .from('balance_transactions')
          .insert({
            user_id: userId,
            amount: amountUAH,
            type: 'deposit',
            status: 'failed',
            payment_method: 'usdt',
            description: `Невдала оплата через USDT: ${callback.payment_status}`,
          });

        return new Response(
          JSON.stringify({ status: 'ok' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Payment is still pending
        console.log('Payment status:', callback.payment_status);
        return new Response(
          JSON.stringify({ status: 'ok' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle payment initiation
    if (req.method === 'POST') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        await supabase.from('edge_function_logs').insert({
          function_name: 'nowpayments-payment',
          operation: 'payment_init',
          status: 'error',
          error_message: 'Not authenticated',
          ip_address: ipAddress,
          user_agent: userAgent,
          duration_ms: Date.now() - startTime,
        });
        return new Response(
          JSON.stringify({ error: 'Not authenticated' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        await supabase.from('edge_function_logs').insert({
          function_name: 'nowpayments-payment',
          operation: 'payment_init',
          status: 'error',
          error_message: 'Invalid authentication',
          ip_address: ipAddress,
          user_agent: userAgent,
          duration_ms: Date.now() - startTime,
        });
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check rate limit: 5 payment attempts per minute
      const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
        _user_id: user.id,
        _ip_address: ipAddress,
        _endpoint: 'nowpayments-payment',
        _max_requests: 5,
        _window_minutes: 1,
      });

      if (!rateLimitOk) {
        console.warn('Rate limit exceeded for user:', user.id);
        await supabase.from('edge_function_logs').insert({
          user_id: user.id,
          function_name: 'nowpayments-payment',
          operation: 'payment_init',
          status: 'error',
          error_message: 'Rate limit exceeded',
          ip_address: ipAddress,
          user_agent: userAgent,
          duration_ms: Date.now() - startTime,
        });
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { amount }: PaymentRequest = await req.json();

      if (!amount || amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid amount' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get current exchange rate UAH to USDT
      const exchangeResponse = await fetch('https://api.nowpayments.io/v1/estimate?amount=' + amount + '&currency_from=uah&currency_to=usdttrc20', {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!exchangeResponse.ok) {
        console.error('Exchange rate error:', await exchangeResponse.text());
        return new Response(
          JSON.stringify({ error: 'Failed to get exchange rate' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const exchangeData = await exchangeResponse.json();
      const amountUSDT = exchangeData.estimated_amount;

      // Generate order ID
      const orderId = `deposit_${user.id}_${Date.now()}`;
      
      const callbackUrl = `${supabaseUrl}/functions/v1/nowpayments-payment/callback`;

      // Create payment
      const paymentData = {
        price_amount: amount,
        price_currency: 'uah',
        pay_currency: 'usdttrc20',
        ipn_callback_url: callbackUrl,
        order_id: orderId,
        order_description: 'Поповнення балансу',
      };

      console.log('Creating NOWPayments payment for user:', user.id, 'amount:', amount, 'UAH');

      const paymentResponse = await fetch('https://api.nowpayments.io/v1/payment', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('NOWPayments error:', errorText);
        return new Response(
          JSON.stringify({ error: 'Payment creation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentResult = await paymentResponse.json();
      
      console.log('NOWPayments response:', paymentResult);

      // Create pending transaction
      await supabase
        .from('balance_transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          type: 'deposit',
          status: 'pending',
          payment_method: 'usdt',
          description: `Очікування оплати через USDT`,
        });

      const responseData = {
        payment_id: paymentResult.payment_id,
        pay_address: paymentResult.pay_address,
        pay_amount: paymentResult.pay_amount,
        pay_currency: paymentResult.pay_currency,
        price_amount: amount,
        price_currency: 'UAH',
        order_id: orderId,
        payment_url: `https://nowpayments.io/payment/?iid=${paymentResult.payment_id}`,
      };

      await supabase.from('edge_function_logs').insert({
        user_id: user.id,
        function_name: 'nowpayments-payment',
        operation: 'payment_init',
        status: 'success',
        request_data: { amount, orderId },
        response_data: responseData,
        ip_address: ipAddress,
        user_agent: userAgent,
        duration_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify(responseData),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('NOWPayments payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
