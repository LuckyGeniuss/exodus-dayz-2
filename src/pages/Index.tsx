import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import VeteranBanner from "@/components/VeteranBanner";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Array<{ productId: string; quantity: number }>>([]);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id);

    if (data && !error) {
      setCartItems(data.map(item => ({
        productId: item.product_id,
        quantity: item.quantity
      })));
    }
  };

  const addToCart = async (productId: string) => {
    const existingItem = cartItems.find(item => item.productId === productId);
    
    if (existingItem) {
      await updateCartQuantity(productId, existingItem.quantity + 1);
    } else {
      const newItems = [...cartItems, { productId, quantity: 1 }];
      setCartItems(newItems);

      if (user) {
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1
        });
      } else {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
      
      toast.success('Товар додано до кошика');
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    const newItems = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    setCartItems(newItems);

    if (user) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);
    } else {
      localStorage.setItem('cart', JSON.stringify(newItems));
    }
  };

  const removeFromCart = async (productId: string) => {
    const newItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(newItems);

    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    } else {
      localStorage.setItem('cart', JSON.stringify(newItems));
    }
    
    toast.success('Товар видалено з кошика');
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    toast.info('Оформлення замовлення буде додано незабаром');
    // TODO: Implement checkout flow
  };

  const categoryMap: Record<string, Category> = {
    "VIP": "vip",
    "Одяг": "clothing",
    "Транспорт": "transport",
    "Косметика": "cosmetic",
    "Музичні кассети": "cassettes",
    "Кастомні предмети": "custom",
  };

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    
    return products.filter(product => {
      const productCategory = categoryMap[product.category];
      return productCategory === selectedCategory;
    });
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onCartOpen={() => setCartOpen(true)} 
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />
      
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
      <Hero />
      <VeteranBanner />
      
      <section id="shop" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Магазин <span className="text-primary">товарів</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Обирайте з нашої колекції VIP-пакетів, косметичних предметів та унікальних модифікацій.
            Всі товари відповідають правилам монетизації Bohemia Interactive.
          </p>
        </div>

        <CategoryFilter onCategoryChange={setSelectedCategory} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onAddToCart={addToCart}
              />
            ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              Товарів у цій категорії поки немає
            </p>
          </div>
        )}
      </section>

      <section id="about" className="bg-card border-y border-border py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Про <span className="text-primary">Exodus DayZ</span>
            </h2>
            <p className="text-muted-foreground mb-4">
              Exodus DayZ — це приватні PVE/PVP сервери з унікальними кастомними модами, 
              створені для справжніх фанатів постапокаліптичного виживання.
            </p>
            <p className="text-muted-foreground mb-4">
              Ми дотримуємося правил монетизації Bohemia Interactive: всі товари в нашому магазині 
              є виключно косметичними та не впливають на баланс гри. Жодного pay-to-win!
            </p>
            <p className="text-muted-foreground">
              Приєднуйтесь до нашої спільноти та насолоджуйтесь справжнім DayZ досвідом 
              з VIP-опціями та ексклюзивними косметичними предметами.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
