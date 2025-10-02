import { Medal } from "lucide-react";

const VeteranBanner = () => {
  return (
    <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-primary/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-4 text-center">
          <Medal className="h-8 w-8 text-primary shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-primary mb-1">
              Шана Героям! 🇺🇦
            </h3>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Ветеранам АТО/ООС знижка 50%</strong> на всі товари. 
              Для отримання знижки зв'яжіться з адміністрацією.
            </p>
          </div>
          <Medal className="h-8 w-8 text-primary shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default VeteranBanner;
