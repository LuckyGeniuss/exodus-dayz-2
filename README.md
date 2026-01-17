# 🎮 Exodus DayZ Shop

Магазин внутриигровых предметів для DayZ сервера Exodus з підтримкою онлайн-оплати, Steam авторизації та системою лояльності.

## 📋 Зміст

- [Функціонал](#-функціонал)
- [Технології](#-технології)
- [Вимоги](#-вимоги)
- [Швидкий старт](#-швидкий-старт)
- [Конфігурація](#-конфігурація)
- [База даних](#-база-даних)
- [Edge Functions](#-edge-functions)
- [Збірка для продакшену](#-збірка-для-продакшену)
- [Розгортання](#-розгортання)
- [Webhook URLs](#-webhook-urls)
- [Вирішення проблем](#-вирішення-проблем)

## ✨ Функціонал

### Основні можливості
- 🛒 **Каталог товарів** з категоріями та фільтрацією
- 🔐 **Авторизація** через Email/Password та Steam
- 💳 **Онлайн-оплата** через Wayforpay та NOWPayments (USDT)
- 💰 **Система балансу** з поповненням та оплатою
- ⭐ **Програма лояльності** з рівнями та кешбеком
- 🎁 **Промокоди** та знижки
- 📦 **Історія замовлень**
- ❤️ **Список бажань**
- 🏆 **Досягнення** з бонусами
- 🎰 **Колесо фортуни** та щоденні бонуси
- 📊 **Адмін-панель** для управління

### Для адміністраторів
- Управління товарами (CRUD)
- Управління замовленнями
- Управління користувачами
- Перегляд статистики

## 🛠 Технології

### Frontend
- **React 18** - UI бібліотека
- **TypeScript** - типізація
- **Vite** - збірка та dev-сервер
- **Tailwind CSS** - стилізація
- **shadcn/ui** - UI компоненти
- **TanStack Query** - управління станом сервера
- **React Router** - маршрутизація

### Backend
- **Supabase** - BaaS платформа
  - PostgreSQL - база даних
  - Edge Functions - серверна логіка
  - Auth - автентифікація
  - Storage - зберігання файлів
  - Realtime - real-time підписки

### Платіжні системи
- **Wayforpay** - прийом карткових платежів
- **NOWPayments** - прийом криптовалюти (USDT)

## 📋 Вимоги

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 або **bun** >= 1.0.0
- **Supabase CLI** (для деплою Edge Functions)
- Обліковий запис **Supabase** (безкоштовний план підходить)

## 🚀 Швидкий старт

### 1. Клонування репозиторію

```bash
git clone https://github.com/YOUR_USERNAME/exodus-dayz-shop.git
cd exodus-dayz-shop
```

### 2. Встановлення залежностей

```bash
npm install
# або
bun install
```

### 3. Налаштування змінних оточення

```bash
cp .env.example .env
```

Відредагуйте `.env` файл, додавши свої значення (див. розділ [Конфігурація](#-конфігурація)).

### 4. Запуск dev-сервера

```bash
npm run dev
# або
bun dev
```

Відкрийте http://localhost:5173 у браузері.

## ⚙️ Конфігурація

### Змінні оточення (.env)

| Змінна | Опис | Обов'язково |
|--------|------|-------------|
| `VITE_SUPABASE_URL` | URL вашого Supabase проекту | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Публічний (anon) ключ Supabase | ✅ |
| `VITE_SUPABASE_PROJECT_ID` | ID Supabase проекту | ✅ |

### Секрети для Edge Functions

Ці секрети потрібно додати в Supabase Dashboard → Settings → Edge Functions → Secrets:

| Секрет | Опис | Де отримати |
|--------|------|-------------|
| `SUPABASE_URL` | URL Supabase проекту | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role ключ | Supabase Dashboard → API |
| `SUPABASE_ANON_KEY` | Anon ключ | Supabase Dashboard → API |
| `WAYFORPAY_MERCHANT_ACCOUNT` | Логін мерчанта Wayforpay | wayforpay.com |
| `WAYFORPAY_SECRET_KEY` | Секретний ключ Wayforpay | wayforpay.com |
| `NOWPAYMENTS_API_KEY` | API ключ NOWPayments | nowpayments.io |
| `NOWPAYMENTS_IPN_SECRET` | IPN секрет NOWPayments | nowpayments.io |
| `RESEND_API_KEY` | API ключ для email | resend.com |

## 🗃 База даних

### Створення Supabase проекту

1. Зайдіть на [supabase.com](https://supabase.com)
2. Створіть новий проект
3. Збережіть URL та API ключі

### Застосування міграцій

Міграції знаходяться в папці `supabase/migrations/`. Для їх застосування:

```bash
# Встановіть Supabase CLI
npm install -g supabase

# Залогіньтесь
supabase login

# Прив'яжіть до проекту
supabase link --project-ref YOUR_PROJECT_ID

# Застосуйте міграції
supabase db push
```

### Завантаження початкових даних

Після міграцій завантажте seed-дані:

```bash
# Через SQL Editor в Supabase Dashboard
# або через psql:
psql -h db.YOUR_PROJECT_ID.supabase.co -U postgres -d postgres -f database/seed.sql
```

Seed-файл містить:
- 🛒 Товари (~25 позицій)
- 🏆 Рівні лояльності (6 рівнів)
- 🎯 Досягнення (5 штук)
- 🎟️ Промокоди
- 🖼️ Банери головної сторінки

### Бекап бази даних

```bash
# Зробити права на виконання
chmod +x scripts/backup-db.sh

# Повний бекап
./scripts/backup-db.sh

# Тільки схема
./scripts/backup-db.sh --schema-only

# Тільки дані
./scripts/backup-db.sh --data-only

# Список бекапів
./scripts/backup-db.sh --list
```

Бекапи зберігаються в директорії `backups/`.

### Основні таблиці

| Таблиця | Опис |
|---------|------|
| `profiles` | Профілі користувачів |
| `products` | Товари |
| `orders` | Замовлення |
| `order_items` | Позиції замовлень |
| `cart_items` | Кошик |
| `wishlist` | Список бажань |
| `reviews` | Відгуки |
| `balance_transactions` | Транзакції балансу |
| `promo_codes` | Промокоди |
| `achievements` | Досягнення |
| `user_achievements` | Досягнення користувачів |
| `loyalty_levels` | Рівні лояльності |
| `notifications` | Сповіщення |

Детальна документація: [database/README.md](database/README.md)

## ⚡ Edge Functions

### Список функцій

| Функція | Опис |
|---------|------|
| `create-order` | Створення замовлення |
| `wayforpay-payment` | Обробка платежів Wayforpay |
| `nowpayments-payment` | Обробка платежів NOWPayments |
| `steam-auth` | Steam авторизація |
| `send-order-email` | Відправка email сповіщень |
| `seed-products` | Наповнення тестовими товарами |

### Деплой Edge Functions

```bash
# Деплой всіх функцій
supabase functions deploy

# Деплой конкретної функції
supabase functions deploy create-order
```

### Додавання секретів

```bash
# Додати секрет
supabase secrets set WAYFORPAY_MERCHANT_ACCOUNT=your_value

# Переглянути список секретів
supabase secrets list
```

## 📦 Збірка для продакшену

```bash
# Збірка проекту
npm run build

# Готові файли будуть в папці dist/
```

### Перевірка збірки локально

```bash
npm run preview
```

## 🌐 Розгортання

### Варіант A: Vercel (рекомендовано)

1. Підключіть GitHub репозиторій на [vercel.com](https://vercel.com)
2. Налаштуйте:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Додайте Environment Variables
4. Натисніть Deploy

### Варіант B: Netlify

1. Підключіть репозиторій на [netlify.com](https://netlify.com)
2. Налаштування збірки:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Додайте змінні оточення в Site settings → Environment variables

### Варіант C: VPS сервер (nginx)

#### 1. Підготовка сервера

```bash
# Оновлення системи
sudo apt update && sudo apt upgrade -y

# Встановлення Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Встановлення nginx
sudo apt install -y nginx
```

#### 2. Клонування та збірка

```bash
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/exodus-dayz-shop.git
cd exodus-dayz-shop

# Створення .env
sudo cp .env.example .env
sudo nano .env  # Додайте свої значення

# Встановлення залежностей та збірка
sudo npm install
sudo npm run build
```

#### 3. Налаштування nginx

Створіть файл `/etc/nginx/sites-available/exodus-shop`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/exodus-dayz-shop/dist;
    index index.html;

    # Gzip стиснення
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Кешування статичних файлів
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Заборона доступу до прихованих файлів
    location ~ /\. {
        deny all;
    }
}
```

Активуйте конфігурацію:

```bash
sudo ln -s /etc/nginx/sites-available/exodus-shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL сертифікат (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Варіант D: Docker

Проект включає `Dockerfile` та `docker-compose.yml` для контейнеризації.

```bash
# Збірка та запуск
docker-compose up -d

# Перегляд логів
docker-compose logs -f

# Зупинка
docker-compose down
```

## 🔗 Webhook URLs

Після розгортання налаштуйте webhook URLs у платіжних системах:

### Wayforpay

У особистому кабінеті Wayforpay:
- **Result URL**: `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/wayforpay-payment`

### NOWPayments

У налаштуваннях NOWPayments:
- **IPN Callback URL**: `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/nowpayments-payment`

## 🔧 Вирішення проблем

### Помилка підключення до Supabase

1. Перевірте правильність `VITE_SUPABASE_URL` та `VITE_SUPABASE_PUBLISHABLE_KEY`
2. Переконайтесь, що проект Supabase активний
3. Перевірте RLS політики на таблицях

### Edge Functions не працюють

1. Перевірте, чи задеплоєні функції: `supabase functions list`
2. Перегляньте логи: `supabase functions logs FUNCTION_NAME`
3. Переконайтесь, що всі секрети додані

### Помилки авторизації

1. Увімкніть Email provider в Supabase Dashboard → Authentication
2. Для Steam авторизації додайте Steam API ключ
3. Перевірте налаштування Site URL в Authentication → URL Configuration

### Помилки збірки

```bash
# Очистіть кеш
rm -rf node_modules/.vite
rm -rf dist

# Перевстановіть залежності
rm -rf node_modules
npm install

# Спробуйте збірку знову
npm run build
```

### Логи Edge Functions

```bash
# Перегляд логів конкретної функції
supabase functions logs create-order --tail

# Перегляд всіх логів
supabase functions logs --tail
```

## 📝 Ліцензія

MIT License - див. файл [LICENSE](LICENSE)

## 🤝 Підтримка

При виникненні проблем створіть Issue в репозиторії або зверніться до розробників.

---

Зроблено з ❤️ для спільноти DayZ Exodus
