import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6">
              <span className="text-primary">Контакти</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Зв'яжіться з нами з будь-яких питань або пропозицій
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Напишіть нам</h2>
                <p className="text-muted-foreground mb-6">
                  Заповніть форму і ми відповімо якомога швидше
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ім'я</label>
                  <Input placeholder="Ваше ім'я" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Тема</label>
                  <Input placeholder="Тема повідомлення" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Повідомлення</label>
                  <Textarea 
                    placeholder="Ваше повідомлення..." 
                    className="min-h-[150px]"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Відправити повідомлення
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Інформація</h2>
                <p className="text-muted-foreground mb-8">
                  Ми завжди раді допомогти та відповісти на ваші запитання
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">support@exodus-dayz.com.ua</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Відповідаємо протягом 24 годин
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary shrink-0">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Discord</h3>
                    <p className="text-muted-foreground">ExodusDayZ#1234</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Приєднуйтесь до нашої спільноти
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 rounded-lg bg-card border border-border">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Сервер</h3>
                    <p className="text-muted-foreground">exodus-dayz.com.ua:2302</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Прямий підключення до гри
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-primary/10 border border-primary/20">
                <h3 className="font-semibold mb-2 text-primary">Час роботи підтримки</h3>
                <p className="text-sm text-muted-foreground">
                  Понеділок - П'ятниця: 9:00 - 21:00<br />
                  Субота - Неділя: 10:00 - 18:00<br />
                  Час: Київський (UTC+2)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
