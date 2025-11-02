import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Ім'я обов'язкове").max(100, "Ім'я занадто довге (максимум 100 символів)"),
  email: z.string().trim().email("Невірний формат email").max(255, "Email занадто довгий"),
  subject: z.string().trim().min(1, "Тема обов'язкова").max(200, "Тема занадто довга (максимум 200 символів)"),
  message: z.string().trim().min(1, "Повідомлення обов'язкове").max(5000, "Повідомлення занадто довге (максимум 5000 символів)"),
});

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input with Zod
    const result = contactSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setSending(true);
    try {
      // Simulate sending (in real app, would call an edge function)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Повідомлення надіслано! Ми відповімо вам якомога швидше.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error("Помилка відправки повідомлення");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => {}} cartItemCount={0} />
      
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ім'я</label>
                  <Input 
                    placeholder="Ваше ім'я" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input 
                    type="email" 
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Тема</label>
                  <Input 
                    placeholder="Тема повідомлення"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Повідомлення</label>
                  <Textarea 
                    placeholder="Ваше повідомлення..." 
                    className="min-h-[150px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={sending}>
                  {sending ? "Відправляємо..." : "Відправити повідомлення"}
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
