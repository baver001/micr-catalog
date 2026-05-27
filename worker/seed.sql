-- Seed data for micr.fun

-- Insert sample apps
INSERT INTO apps (id, slug, name, description, category, icon, color, url, image, views, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'spend-elons-money', 'Потрать деньги Илона', 'Симулятор траты состояния Илона Маска', 'games', 'dollar-sign', 'from-emerald-500 to-green-500', 'https://neal.fun/spend/', NULL, 1250, 'published'),
('550e8400-e29b-41d4-a716-446655440002', 'password-game', 'The Password Game', 'Создай пароль по всё более безумным правилам', 'games', 'lock', 'from-red-500 to-rose-500', 'https://neal.fun/password-game/', NULL, 980, 'published'),
('550e8400-e29b-41d4-a716-446655440003', 'infinite-craft', 'Infinite Craft', 'Комбинируй элементы и создавай новые', 'creative', 'sparkles', 'from-purple-500 to-pink-500', 'https://neal.fun/infinite-craft/', NULL, 2100, 'published'),
('550e8400-e29b-41d4-a716-446655440004', 'draw-logo', 'Draw Logo From Memory', 'Нарисуй логотип по памяти', 'creative', 'palette', 'from-blue-500 to-cyan-500', 'https://neal.fun/draw-logos-from-memory/', NULL, 750, 'published'),
('550e8400-e29b-41d4-a716-446655440005', 'absurd-trolley', 'Absurd Trolley Problems', 'Решай абсурдные моральные дилеммы', 'fun', 'brain', 'from-violet-500 to-purple-500', 'https://neal.fun/absurd-trolley-problems/', NULL, 620, 'published'),
('550e8400-e29b-41d4-a716-446655440006', 'life-stats', 'Life Stats', 'Статистика твоей жизни в реальном времени', 'tools', 'activity', 'from-amber-500 to-orange-500', 'https://neal.fun/life-stats/', NULL, 890, 'published'),
('550e8400-e29b-41d4-a716-446655440007', 'internet-artifacts', 'Internet Artifacts', 'Музей истории интернета', 'learning', 'archive', 'from-teal-500 to-emerald-500', 'https://neal.fun/internet-artifacts/', NULL, 540, 'published'),
('550e8400-e29b-41d4-a716-446655440008', 'deep-sea', 'Deep Sea', 'Погрузись на дно океана', 'learning', 'waves', 'from-cyan-500 to-blue-500', 'https://neal.fun/deep-sea/', NULL, 1100, 'published');

-- You can add more apps here
