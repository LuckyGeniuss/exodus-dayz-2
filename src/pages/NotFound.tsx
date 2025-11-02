import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-9xl font-bold text-primary">404</h1>
            <h2 className="text-3xl font-bold">Сторінку не знайдено</h2>
            <p className="text-muted-foreground text-lg">
              На жаль, сторінка яку ви шукаєте не існує або була видалена
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/")}>
              <Home className="mr-2 h-5 w-5" />
              На головну
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/")}>
              <Search className="mr-2 h-5 w-5" />
              До магазину
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
