import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Shield, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { Badge } from "@/components/ui/badge";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCartOpen={() => {}} cartItemCount={0} />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Товар не знайдено</h1>
          <p className="text-muted-foreground mb-8">На жаль, цей товар не існує або був видалений</p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Повернутися до магазину
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => {}} cartItemCount={0} />
      
      <div className="container mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          className="mb-8"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад до магазину
        </Button>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-3">{product.category}</Badge>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {product.fullDescription || product.description}
              </p>
              
              {product.features && product.features.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="font-semibold text-lg">Особливості:</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-2 py-6 border-y border-border">
              <span className="text-5xl font-bold text-primary">{product.price}</span>
              <span className="text-2xl text-muted-foreground">₴</span>
            </div>

            <div className="space-y-4">
              <Button size="lg" className="w-full">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Додати до кошика
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Купити зараз
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-6 border-t border-border">
              <h3 className="font-semibold text-lg">Особливості:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Відповідає правилам BI</p>
                    <p className="text-sm text-muted-foreground">
                      Тільки косметичні зміни, без pay-to-win
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Миттєва доставка</p>
                    <p className="text-sm text-muted-foreground">
                      Отримайте товар одразу після оплати
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8">
            Схожі <span className="text-primary">товари</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter(p => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map(relatedProduct => (
                <Link 
                  key={relatedProduct.id} 
                  to={`/product/${relatedProduct.id}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-lg border border-border transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1">
                    <div className="aspect-square bg-muted overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold line-clamp-1 mb-2">{relatedProduct.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-primary">{relatedProduct.price}</span>
                        <span className="text-muted-foreground">₴</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
