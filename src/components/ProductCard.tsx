import { ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { useWishlist } from "@/hooks/useWishlist";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  fullDescription?: string;
  features?: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  return (
    <Link to={`/product/${product.id}`} className="animate-fade-in">
      <Card className="overflow-hidden transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 bg-gradient-to-br from-card to-card/80 border-border h-full group">
        <CardHeader className="p-0">
          <div className="aspect-square overflow-hidden bg-muted relative">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className="absolute top-2 right-2 h-9 w-9 p-0 bg-background/80 hover:bg-background backdrop-blur-sm"
            >
              <Heart 
                className={`h-5 w-5 transition-colors ${
                  inWishlist ? 'fill-primary text-primary' : 'text-muted-foreground'
                }`}
              />
            </Button>
          </div>
        </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="outline">
            {product.category}
          </Badge>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">{product.price}</span>
          <span className="text-muted-foreground">₴</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full" 
            variant="default"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product.id);
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            До кошика
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
