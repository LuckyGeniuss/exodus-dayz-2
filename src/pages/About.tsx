import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Users, Zap, Trophy } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Про <span className="text-primary">Exodus DayZ</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Приватні PVE/PVP сервери з унікальними модами для справжніх фанатів виживання
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Чесна гра</h3>
              <p className="text-muted-foreground">
                Дотримуємося правил Bohemia Interactive. Жодного pay-to-win!
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Спільнота</h3>
              <p className="text-muted-foreground">
                Активна українська спільнота гравців та адміністрація
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Кастомні моди</h3>
              <p className="text-muted-foreground">
                Унікальні модифікації для покращення ігрового досвіду
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">VIP система</h3>
              <p className="text-muted-foreground">
                Ексклюзивні косметичні бонуси для підтримки сервера
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Наша місія</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Exodus DayZ створений для того, щоб надати українським гравцям найкращий досвід 
                виживання в світі DayZ. Ми поєднуємо класичний геймплей з унікальними модифікаціями, 
                зберігаючи баланс між викликом та задоволенням від гри.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Чому Exodus?</h2>
              <ul className="space-y-4 text-muted-foreground text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Стабільні сервери</strong> — 99.9% uptime та оптимізована продуктивність</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Активна підтримка</strong> — швидка реакція адміністрації на проблеми гравців</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Регулярні оновлення</strong> — постійно додаємо новий контент та покращення</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Справедлива монетизація</strong> — тільки косметичні предмети, без переваг у бою</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Правила гри</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                Ми суворо дотримуємося правил монетизації Bohemia Interactive. Всі товари в нашому 
                магазині є виключно косметичними та не надають жодних переваг у бою чи виживанні.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Купуючи VIP-статус або косметичні предмети, ви підтримуєте роботу серверів та 
                допомагаєте розвивати проект, отримуючи натомість унікальний стиль та ексклюзивний вигляд.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
