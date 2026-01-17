-- =====================================================
-- Exodus DayZ Shop - Database Seed Data
-- =====================================================
-- Этот файл содержит начальные данные для базы данных.
-- Запустите после применения миграций: supabase db push
-- 
-- Использование:
-- 1. Через Supabase SQL Editor
-- 2. Или: psql -h <host> -U postgres -d postgres -f seed.sql
-- =====================================================

-- Очистка существующих данных (опционально, раскомментируйте при необходимости)
-- TRUNCATE products, loyalty_levels, achievements, promo_codes, homepage_banners CASCADE;

-- =====================================================
-- 1. PRODUCTS (Товары)
-- =====================================================
INSERT INTO products (id, name, category, price, description, image) VALUES
-- Будматеріали
('build-camonet', 'Камуфляжна сітка', 'Будматеріали', 15, 'Маскувальна сітка для приховування бази', '/src/assets/products/build-camonet-gen.jpg'),
('build-codelock', 'Кодлок', 'Будматеріали', 80, 'Кодовий замок для захисту вашої бази', '/src/assets/products/build-codelock-gen.jpg'),
('build-flagpole', 'Флагшток', 'Будматеріали', 80, 'Флагшток для позначення території', '/src/assets/products/build-flagpole-gen.jpg'),
('build-nails', 'Цвяхи', 'Будматеріали', 50, 'Пачка цвяхів для будівництва', '/src/assets/products/build-nails-gen.jpg'),

-- Запчастини
('parts-battery', 'Акумулятор', 'Запчастини', 30, 'Автомобільний акумулятор', '/src/assets/products/parts-battery-gen.jpg'),
('parts-canister', 'Каністра', 'Запчастини', 30, 'Каністра для палива', '/src/assets/products/parts-battery-gen.jpg'),
('parts-key', 'Ключ', 'Запчастини', 10, 'Ключ від транспорту', '/src/assets/products/build-codelock-gen.jpg'),
('parts-radiator', 'Радіатор', 'Запчастини', 30, 'Радіатор для транспорту', '/src/assets/products/parts-radiator-gen.jpg'),
('parts-sparkplug', 'Свічка', 'Запчастини', 30, 'Свічка запалювання', '/src/assets/products/parts-battery-gen.jpg'),

-- Контейнери
('container-bigbox', 'Великий ящик', 'Контейнери', 140, 'Великий ящик на 300 слотів', '/src/assets/products/container-crate-gen.jpg'),
('container-pallet', 'Військова палета', 'Контейнери', 270, 'Військова палета на 600 слотів', '/src/assets/products/container-crate-gen.jpg'),
('container-military-locker', 'Військова шафа', 'Контейнери', 250, 'Велика військова шафа для зберігання', '/src/assets/products/container-locker-gen.jpg'),
('container-personal-locker', 'Персональна шафа', 'Контейнери', 160, 'Персональна шафа для особистих речей', '/src/assets/products/container-locker-gen.jpg'),
('container-chest', 'Скриня', 'Контейнери', 50, 'Дерев''яна скриня на 100 слотів', '/src/assets/products/container-crate-gen.jpg'),
('container-weaponrack', 'Стійка для зброї', 'Контейнери', 220, 'Стійка для зберігання 24 одиниць зброї', '/src/assets/products/container-weaponrack-gen.jpg'),

-- Набори
('kit-big', 'Біг старт', 'Набори', 500, '7 кодлоків, 8 пачок цвяхів, 3 молотки, 3 топора, 3 плоскогубців, 3 пили, 3 лопати, 6 точильних камнів, 40 листів металу, 50 дощок, 16 бревен, 6 проволок, розмітка, 4 матроських сундуки', '/src/assets/products/kit-starter-gen.jpg'),
('kit-duo', 'Дуо старт', 'Набори', 130, '2 кодлоки, 2 пачки цвяхів, 2 молотки, 2 топора, 2 плоскогубців, 2 пили, 2 лопати, 2 точильних камня, 20 дощок, 2 бревна, 2 проволоки, розмітка, матроський сундук', '/src/assets/products/kit-starter-gen.jpg'),
('kit-squad', 'Сквад старт', 'Набори', 250, '6 кодлоків, 4 пачки цвяхів, 3 молотки, 3 топора, 3 плоскогубців, 3 пили, 3 лопати, 4 точильних камня, 30 листів металу, 40 дощок, 10 бревен, 4 проволоки, розмітка, 3 матроських сундуки', '/src/assets/products/kit-starter-gen.jpg'),
('kit-solo', 'Соло старт', 'Набори', 70, '1 кодлок, 1 пачка цвяхів, 1 молоток, 1 топор, 1 плоскогубці, 1 пила, 1 лопата, 1 точильний камінь, 10 дощок, 1 бревно, 1 проволока, розмітка', '/src/assets/products/kit-starter-gen.jpg'),

-- Транспорт
('vehicle-atv', 'Квадроцикл', 'Транспорт', 150, 'Маневрений ATV для бездоріжжя', '/src/assets/products/vehicle-atv-gen.jpg'),
('vehicle-hmmwv', 'HMMWV', 'Транспорт', 500, 'Бронетранспортер Humvee з кулеметом', '/src/assets/products/vehicle-humvee-gen.jpg'),
('vehicle-pickup', 'Пікап', 'Транспорт', 200, 'Вантажний пікап для перевезення', '/src/assets/products/vehicle-pickup-gen.jpg'),
('vehicle-sedan', 'Седан', 'Транспорт', 150, 'Цивільний седан для пересування', '/src/assets/products/vehicle-sedan-gen.jpg'),
('vehicle-truck', 'Вантажівка', 'Транспорт', 350, 'Велика вантажівка для транспортування', '/src/assets/products/vehicle-truck-gen.jpg')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  image = EXCLUDED.image;

-- =====================================================
-- 2. LOYALTY LEVELS (Уровни лояльности)
-- =====================================================
INSERT INTO loyalty_levels (id, name, icon, color, min_spent, discount_percent, cashback_percent) VALUES
('4c2fda15-6da4-40a3-a4e0-31b17a3cb100', 'Новачок', '🥉', '#CD7F32', 0, 0, 1),
('e8d4d064-a77a-4225-952c-4a47a99cbe25', 'Бронза', '🥉', '#CD7F32', 500, 2, 2),
('65d2baaa-c9a5-4fd8-b6b9-c1441920bc5b', 'Срібло', '🥈', '#C0C0C0', 2000, 5, 3),
('47987f4c-9165-4653-964d-0e2f4f618145', 'Золото', '🥇', '#FFD700', 5000, 8, 5),
('eb39b02f-7498-4330-b6de-e7bce06aa9df', 'Платина', '💎', '#E5E4E2', 10000, 12, 7),
('0db5bef9-bfb6-4a4b-9b7b-2fd49c8669ab', 'Діамант', '💎', '#B9F2FF', 25000, 15, 10)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  min_spent = EXCLUDED.min_spent,
  discount_percent = EXCLUDED.discount_percent,
  cashback_percent = EXCLUDED.cashback_percent;

-- =====================================================
-- 3. ACHIEVEMENTS (Достижения)
-- =====================================================
INSERT INTO achievements (id, name, description, icon, requirement_type, requirement_value, reward_balance) VALUES
('b9d3b09f-a347-4633-bdbd-419e487d6329', 'Перша покупка', 'Зробіть своє перше замовлення', '🎯', 'orders_count', 1, 50),
('fd49e078-7e97-436b-9683-9fbcb8413083', 'Постійний клієнт', 'Зробіть 5 замовлень', '⭐', 'orders_count', 5, 200),
('80880007-d1cf-44d4-8eb1-4da15011ee97', 'Критик', 'Залишіть 3 відгуки', '📝', 'reviews_count', 3, 100),
('dc75b026-2320-492e-b4cd-a0fe68a5be7e', 'Експерт', 'Залишіть 10 відгуків', '🏆', 'reviews_count', 10, 300),
('4be43099-a17d-45f5-a406-f388e41d7722', 'Великий покупець', 'Витратьте понад 1000₴', '💎', 'total_spent', 1000, 150)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  requirement_type = EXCLUDED.requirement_type,
  requirement_value = EXCLUDED.requirement_value,
  reward_balance = EXCLUDED.reward_balance;

-- =====================================================
-- 4. PROMO CODES (Промокоды)
-- =====================================================
-- Примечание: даты валидности нужно обновить при использовании
INSERT INTO promo_codes (id, code, discount_percent, max_uses, current_uses, min_order_amount, valid_from, valid_until, is_active) VALUES
('9495c38e-4594-415c-91b4-b9edc8a80d53', 'EXODUS10', 10, 100, 0, 100, NOW(), NOW() + INTERVAL '30 days', true),
('017a84b0-c71d-46bd-87a3-94f830f1a14f', 'NEWPLAYER', 15, 50, 0, 0, NOW(), NOW() + INTERVAL '14 days', true),
('71383153-0fc7-4850-97c1-e4d2526e3480', 'VIP20', 20, 20, 0, 500, NOW(), NOW() + INTERVAL '7 days', true)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  discount_percent = EXCLUDED.discount_percent,
  max_uses = EXCLUDED.max_uses,
  min_order_amount = EXCLUDED.min_order_amount,
  valid_from = EXCLUDED.valid_from,
  valid_until = EXCLUDED.valid_until,
  is_active = EXCLUDED.is_active;

-- =====================================================
-- 5. HOMEPAGE BANNERS (Баннеры главной страницы)
-- =====================================================
INSERT INTO homepage_banners (id, title, subtitle, image_url, link_url, link_text, badge_text, badge_color, background_gradient, display_order, is_active) VALUES
('ea144239-5ce5-4c55-8faf-1bba8def14d7', '🎮 Стартовий набір виживання', 'Все необхідне для початку гри: зброя, їжа, медикаменти', '/workshop/welcome-pack.jpg', '/bundles', 'Купити зі знижкою', '-30%', 'destructive', 'from-zinc-900 via-green-900 to-zinc-900', 1, true),
('70cf7866-3286-4ad1-9461-7cb55397d2e1', '🔧 Збірка "Механік"', 'Повний набір запчастин + транспорт зі знижкою 40%', '/workshop/material-pack.jpg', '/bundles', 'Переглянути збірку', '-40%', 'destructive', 'from-zinc-900 via-amber-900 to-zinc-900', 2, true),
('1874e8a1-9a7d-4196-adc3-46d70293f240', '⭐ VIP Пріоритет', 'Швидкий вхід на сервер без черги + бонуси', '/workshop/overdose-pack.jpg', '/bundles', 'Отримати VIP', 'VIP', 'default', 'from-zinc-900 via-purple-900 to-zinc-900', 3, true),
('cf239adf-93e5-4d0b-aba7-2a89c38c77f9', '🏠 Будівельний комплект', 'Все для створення неприступної бази: цвяхи, замки, сітки', '/workshop/nsfr-framework.jpg', '/bundles', 'До будматеріалів', '-25%', 'secondary', 'from-zinc-900 via-stone-800 to-zinc-900', 4, true),
('fd8cfaf2-b3c1-440f-aef5-c3932de412f9', 'OVERDOSE PACK', 'Медичні припаси та зброя для виживання. Все що потрібно для тривалих рейдів!', '/workshop/overdose-pack.jpg', '/product/kit-big', 'Переглянути', 'НОВИНКА', '#10B981', 'from-green-900/90 via-green-800/80 to-emerald-900/70', 5, true),
('ff84e348-651d-4d9c-9775-6dd31db0e827', 'ZOMBIE FLAMETHROWER', 'Спали орди зомбі! Унікальна вогнемет зброя для справжніх мисливців.', '/workshop/zombie-flamethrower.jpg', '/product/vehicle-hmmwv', 'Переглянути', 'ЕКСКЛЮЗИВ', '#EF4444', 'from-orange-900/90 via-red-800/80 to-amber-900/70', 6, true),
('894b3b2e-a86d-413c-84d2-b8be3dae2a1a', 'TACTICAL SHIELDS', 'Захисти себе та свою команду. Бронеплити та щити найвищої якості.', '/workshop/tactical-shields.jpg', '/product/container-weaponrack', 'Замовити', 'ЗАХИСТ', '#3B82F6', 'from-blue-900/90 via-slate-800/80 to-gray-900/70', 7, true),
('e93fd359-6bfc-4478-9be4-27f75a6d8f8f', 'STREET WARRIOR', 'Міський камуфляж та тактичне спорядження. Стань тінню у пост-апокаліпсисі.', '/workshop/street-warrior.jpg', '/product/kit-duo', 'Купити', '-30%', '#8B5CF6', 'from-purple-900/90 via-violet-800/80 to-indigo-900/70', 8, true),
('5ed9ce6f-660b-45b1-9e16-89ae0c715f7b', 'NSFR FRAMEWORK', 'Повний набір модифікацій для DayZ серверів. Професійні інструменти.', '/workshop/nsfr-framework.jpg', '/bundles', 'Детальніше', 'ДЛЯ СЕРВЕРІВ', '#F59E0B', 'from-amber-900/90 via-yellow-800/80 to-orange-900/70', 9, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  image_url = EXCLUDED.image_url,
  link_url = EXCLUDED.link_url,
  link_text = EXCLUDED.link_text,
  badge_text = EXCLUDED.badge_text,
  badge_color = EXCLUDED.badge_color,
  background_gradient = EXCLUDED.background_gradient,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- =====================================================
-- Проверка данных
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Seed completed successfully!';
  RAISE NOTICE 'Products: %', (SELECT COUNT(*) FROM products);
  RAISE NOTICE 'Loyalty Levels: %', (SELECT COUNT(*) FROM loyalty_levels);
  RAISE NOTICE 'Achievements: %', (SELECT COUNT(*) FROM achievements);
  RAISE NOTICE 'Promo Codes: %', (SELECT COUNT(*) FROM promo_codes);
  RAISE NOTICE 'Homepage Banners: %', (SELECT COUNT(*) FROM homepage_banners);
END $$;
