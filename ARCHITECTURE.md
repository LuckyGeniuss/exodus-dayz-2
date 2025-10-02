# Архітектура Exodus DayZ Shop

## Реалізовані функції ✅

### 1. Базова структура
- ✅ Головна сторінка з товарами
- ✅ Фільтрація за категоріями
- ✅ Детальні сторінки товарів з розширеними описами
- ✅ Сторінка "Про нас"
- ✅ Сторінка "Контакти"
- ✅ Банер про знижку 50% для ветеранів АТО/ООС

### 2. Товари
- ✅ 40 унікальних товарів з реалістичними зображеннями
- ✅ Розширені описи з характеристиками
- ✅ Розподіл по категоріях (VIP, Одяг, Транспорт, Косметика, Касети)

## Необхідна імплементація 🚧

### 1. Авторізація через Steam ID

#### Технічний стек:
- Lovable Cloud (Supabase Auth)
- Steam OpenID Authentication
- JWT токени для сесій

#### База даних:
```sql
-- Таблиця профілів користувачів
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  steam_id VARCHAR(20) UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  balance DECIMAL(10, 2) DEFAULT 0,
  is_veteran BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблиця ролей (для безпеки)
CREATE TYPE app_role AS ENUM ('user', 'veteran', 'moderator', 'admin');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
```

#### Компоненти:
- `src/components/auth/SteamLogin.tsx` - Кнопка входу через Steam
- `src/components/auth/AuthProvider.tsx` - Context для авторизації
- `src/pages/Auth.tsx` - Сторінка авторизації
- `src/hooks/useAuth.ts` - Hook для роботи з авторизацією

### 2. Корзина товарів

#### Функціонал:
- Додавання/видалення товарів
- Збереження в localStorage (гостьовий режим)
- Збереження в БД (авторизовані користувачі)
- Синхронізація між пристроями

#### База даних:
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

#### Компоненти:
- `src/components/cart/CartButton.tsx` - Кнопка корзини в Header
- `src/components/cart/CartDrawer.tsx` - Бічна панель з корзиною
- `src/components/cart/CartItem.tsx` - Елемент корзини
- `src/hooks/useCart.ts` - Hook для роботи з корзиною
- `src/lib/cart.ts` - Логіка корзини

### 3. Історія покупок

#### База даних:
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL, -- 'balance', 'card', 'usdt'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Компоненти:
- `src/pages/Orders.tsx` - Сторінка історії покупок
- `src/components/orders/OrderCard.tsx` - Картка замовлення
- `src/hooks/useOrders.ts` - Hook для роботи з замовленнями

### 4. Система балансу

#### Функціонал:
- Поповнення балансу (карта, USDT)
- Списання при покупці
- Історія транзакцій
- Автоматичне застосування знижки для ветеранів

#### База даних:
```sql
CREATE TABLE balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL, -- 'deposit', 'purchase', 'refund'
  payment_method TEXT, -- 'card', 'usdt', NULL for purchases
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Компоненти:
- `src/pages/Balance.tsx` - Сторінка балансу
- `src/components/balance/DepositForm.tsx` - Форма поповнення
- `src/components/balance/TransactionHistory.tsx` - Історія транзакцій

### 5. Система платежів

#### 5.1. Оплата в гривнях (картою)

**Рекомендований провайдер: Wayforpay**
- Підтримка Apple Pay та Google Pay
- Миттєві перекази
- Низька комісія
- Українська компанія

**Альтернативи:**
- LiqPay (ПриватБанк)
- Fondy
- Portmone

#### 5.2. Оплата в USDT

**Рекомендований провайдер: NOWPayments**
- Підтримка USDT (TRC-20, ERC-20)
- API для автоматичної конвертації по курсу
- Webhooks для підтвердження платежів

**Альтернативи:**
- CoinGate
- Plisio
- BTCPay Server (self-hosted)

#### 5.3. Конвертація валют

**API для курсів:**
- PrivatBank API (безкоштовно)
- NBU API (офіційний курс НБУ)
- CoinGecko API (для USDT)

```typescript
// Приклад Edge Function для розрахунку ціни в USDT
export async function calculateUSDTPrice(priceUAH: number): Promise<number> {
  // 1. Отримати курс USD/UAH з PrivatBank
  const usdRate = await fetch('https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=5');
  
  // 2. Отримати курс USDT/USD з CoinGecko
  const usdtRate = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd');
  
  // 3. Конвертувати UAH -> USD -> USDT
  return priceUAH / usdRate / usdtRate;
}
```

#### Edge Functions:
```
supabase/functions/
  ├── create-payment/          # Створення платежу
  ├── confirm-payment/         # Підтвердження платежу (webhook)
  ├── get-exchange-rates/      # Отримання курсів валют
  ├── process-purchase/        # Обробка покупки
  └── apply-veteran-discount/  # Застосування знижки ветеранам
```

### 6. RLS Policies (Row Level Security)

```sql
-- Користувачі можуть читати свій профіль
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Користувачі можуть оновлювати свій профіль
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Користувачі можуть читати свої замовлення
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Користувачі можуть читати свої транзакції
CREATE POLICY "Users can read own transactions"
  ON balance_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Адміністратори можуть читати всі замовлення
CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
```

## Етапи впровадження

### Фаза 1: Інфраструктура (2-3 дні)
1. ✅ Підключити Lovable Cloud
2. Створити таблиці БД
3. Налаштувати RLS policies
4. Створити Edge Functions для платежів

### Фаза 2: Авторизація (1-2 дні)
1. Інтеграція Steam OpenID
2. Створити компоненти авторізації
3. Тестування входу/виходу

### Фаза 3: Корзина (1 день)
1. Створити компоненти корзини
2. Реалізувати логіку додавання/видалення
3. Синхронізація з БД

### Фаза 4: Баланс і транзакції (2-3 дні)
1. Створити систему балансу
2. Інтегрувати Wayforpay для поповнення
3. Історія транзакцій

### Фаза 5: Платежі USDT (2-3 дні)
1. Інтегрувати NOWPayments
2. Реалізувати конвертацію валют
3. Webhooks для підтвердження

### Фаза 6: Історія покупок (1 день)
1. Створити сторінку замовлень
2. Відображення деталей замовлень
3. Статуси платежів

### Фаза 7: Знижки для ветеранів (1 день)
1. Система верифікації ветеранів (адмін-панель)
2. Автоматичне застосування 50% знижки
3. Відображення знижки в корзині

## Додаткові покращення

### UX/UI
- 🎨 Темна/світла тема
- 📱 Повна адаптивність під мобільні
- ⚡ Skeleton loaders при завантаженні
- 🔔 Toast notifications для дій користувача
- 🎭 Анімації переходів

### SEO
- 📄 Динамічні meta-теги для товарів
- 🗺️ Sitemap.xml
- 🤖 robots.txt
- 📊 Google Analytics інтеграція

### Безпека
- 🔐 HTTPS only
- 🛡️ Rate limiting для API
- 🚫 CSRF protection
- 🔑 Безпечне зберігання API ключів у Secrets

### Продуктивність
- 🖼️ Оптимізація зображень (WebP)
- ⚡ Lazy loading компонентів
- 💾 Caching стратегії
- 📦 Code splitting

## Контакти для інтеграції

### Необхідні облікові записи:
1. **Wayforpay** - wayforpay.com (реєстрація для мерчанта)
2. **NOWPayments** - nowpayments.io (реєстрація API)
3. **Steam API** - steamcommunity.com/dev (Steam Web API Key)

### Налаштування:
- Webhook URLs потрібно буде налаштувати після деплою
- API ключі зберігати в Lovable Cloud Secrets
- Тестові режими для всіх платіжних систем

## Примітки

- Всі ціни в БД зберігаються в гривнях
- Конвертація в USDT відбувається динамічно
- Знижка 50% для ветеранів застосовується автоматично
- Адміністратор вручну встановлює статус ветерана після верифікації
