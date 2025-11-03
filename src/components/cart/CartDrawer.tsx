import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { products } from "@/data/products";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: Array<{ productId: string; quantity: number }>;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

const CartDrawer = ({ open, onClose, items, onUpdateQuantity, onRemove, onCheckout }: CartDrawerProps) => {
  const { user } = useAuth();
  
  const total = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const discount = user ? 0 : 0; // TODO: Implement veteran discount
  const finalTotal = total - discount;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg animate-slide-in-right">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Кошик
          </SheetTitle>
          <SheetDescription>
            {items.length === 0 ? 'Ваш кошик порожній' : `${items.length} товар(ів) у кошику`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
            <ShoppingBag className="h-16 w-16 mb-4 opacity-20" />
            <p>Додайте товари до кошика</p>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {items.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;

                return (
                  <div 
                    key={item.productId} 
                    className="flex gap-4 p-4 border rounded-lg transition-all hover:shadow-md animate-fade-in hover-scale"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.price} ₴</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(product.id, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(product.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8"
                          onClick={() => onRemove(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Сума:</span>
                  <span>{total} ₴</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-2">
                      Знижка ветерана АТО/ООС:
                      <Badge variant="secondary">-50%</Badge>
                    </span>
                    <span>-{discount} ₴</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>До сплати:</span>
                  <span>{finalTotal} ₴</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  if (user) {
                    onCheckout();
                  }
                }}
                disabled={!user}
              >
                {user ? 'Оформити замовлення' : 'Увійдіть для покупки'}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;