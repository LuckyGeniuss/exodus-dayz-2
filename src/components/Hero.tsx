import { Button } from "./ui/button";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background"></div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 className="mb-4 text-5xl md:text-7xl font-bold tracking-tight">
          <span className="text-foreground">EXODUS</span>{" "}
          <span className="text-primary">DayZ</span>
        </h1>
        <p className="mb-8 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          Приватні PVE/PVP сервери з кастомними модами та VIP-опціями
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-base">
            Переглянути товари
          </Button>
          <Button size="lg" variant="outline" className="text-base">
            Про сервер
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
