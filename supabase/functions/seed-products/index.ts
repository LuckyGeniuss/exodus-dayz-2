import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Import product data
    const products = [
      // VIP
      { id: 'vip-1', name: 'VIP статус (30 днів)', price: 300, description: 'Ексклюзивний VIP статус на 30 днів', image: '/assets/vip-badge.jpg', category: 'vip' },
      
      // Transport
      { id: 'vehicle-1', name: 'Кастомний автомобіль', price: 500, description: 'Унікальний тюнінгований автомобіль', image: '/assets/vehicle-custom.jpg', category: 'transport' },
      
      // Clothing
      { id: 'clothing-1', name: 'Худі з логотипом', price: 150, description: 'Стильне худі з логотипом сервера', image: '/assets/clothing-hoodie.jpg', category: 'clothing' },
      { id: 'clothing-2', name: 'Бандана', price: 50, description: 'Крута бандана', image: '/assets/clothing-bandana.jpg', category: 'clothing' },
      { id: 'clothing-3', name: 'Череп-маска', price: 100, description: 'Маска у вигляді черепа', image: '/assets/clothing-skull-mask.jpg', category: 'clothing' },
      
      // Cosmetics
      { id: 'cosmetic-1', name: 'Золота зброя', price: 800, description: 'Ексклюзивний золотий скін для зброї', image: '/assets/cosmetic-golden-gun.jpg', category: 'cosmetics' },
      { id: 'cosmetic-2', name: 'Кольоровий дим', price: 200, description: 'Ефект кольорового диму', image: '/assets/cosmetic-smoke.jpg', category: 'cosmetics' },
      
      // Cassettes
      { id: 'cassette-1', name: 'Рок-колекція', price: 75, description: 'Збірка легендарних рок-хітів', image: '/assets/cassette-rock.jpg', category: 'cassettes' },
    ];

    // Insert products
    const { error: insertError } = await supabaseClient
      .from('products')
      .upsert(products, { onConflict: 'id' });

    if (insertError) {
      console.error('Error inserting products:', insertError);
      throw insertError;
    }

    console.log('Products seeded successfully');

    return new Response(
      JSON.stringify({ message: 'Products seeded successfully', count: products.length }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in seed-products function:', error);
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
