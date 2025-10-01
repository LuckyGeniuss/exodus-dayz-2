import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-primary">EXODUS</span>
              <span className="text-foreground"> DayZ</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Головна
            </a>
            <a href="#shop" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Магазин
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Про сервер
            </a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Контакти
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button variant="military">Увійти</Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
