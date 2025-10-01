import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/product/${product.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 bg-gradient-to-br from-card to-card/80 border-border h-full">
        <CardHeader className="p-0">
          <div className="aspect-square overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform hover:scale-110"
            />
          </div>
        </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded">
            {product.category}
          </span>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">{product.price}</span>
          <span className="text-muted-foreground">₴</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
          <Button className="w-full" variant="default">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Придбати
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
