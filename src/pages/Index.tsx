import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import VeteranBanner from "@/components/VeteranBanner";
import CategoryFilter, { Category } from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { products } from "@/data/products";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

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
      <Header />
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
            <ProductCard key={product.id} product={product} />
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
