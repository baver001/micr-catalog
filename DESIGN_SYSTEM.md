# Дизайн-система micr.fun

Модульная, централизованная дизайн-система для консистентного UI.

## Структура файлов

```
styles/
├── design-system/
│   ├── index.css        # Точка входа (импортирует все модули)
│   ├── _tokens.css      # CSS переменные (цвета, spacing, typography)
│   ├── _typography.css  # Текстовые стили
│   ├── _layout.css      # Flexbox, Grid, spacing утилиты
│   ├── _components.css  # UI компоненты (кнопки, карточки, инпуты)
│   └── _effects.css     # Анимации, переходы, эффекты
└── main.css             # Основной файл + специфичные стили
```

---

## Цветовая палитра

### Семантические цвета

| Токен | Описание | Dark | Light |
|-------|----------|------|-------|
| `--color-bg-primary` | Основной фон | `#121212` | `#f9fafb` |
| `--color-bg-secondary` | Вторичный фон | `rgba(255,255,255,0.03)` | `rgba(0,0,0,0.02)` |
| `--color-bg-tertiary` | Третичный фон | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.04)` |
| `--color-surface` | Поверхность карточек | `rgba(255,255,255,0.03)` | `rgba(0,0,0,0.02)` |
| `--color-text-primary` | Основной текст | `#ffffff` | `#111827` |
| `--color-text-secondary` | Вторичный текст | `#9ca3af` | `#4b5563` |
| `--color-text-muted` | Приглушенный текст | `#6b7280` | `#9ca3af` |

### Акцентные цвета

| Токен | Значение |
|-------|----------|
| `--color-accent-primary` | `#3b82f6` (синий) |
| `--color-accent-secondary` | `#2dd4bf` (teal) |
| `--color-accent-purple` | `#a855f7` |
| `--color-accent-gradient` | `linear-gradient(135deg, #3b82f6, #2dd4bf)` |

### Статусы

| Токен | Цвет | Использование |
|-------|------|---------------|
| `--color-success` | `#22c55e` | Успешные операции |
| `--color-warning` | `#eab308` | Предупреждения |
| `--color-error` | `#ef4444` | Ошибки |
| `--color-info` | `#3b82f6` | Информация |

### Категории приложений

| Категория | Цвет | Glow |
|-----------|------|------|
| Games | `#f59e0b` | `rgba(245, 158, 11, 0.15)` |
| Tools | `#3b82f6` | `rgba(59, 130, 246, 0.15)` |
| Creative | `#a855f7` | `rgba(168, 85, 247, 0.15)` |
| Learning | `#10b981` | `rgba(16, 185, 129, 0.15)` |
| Fun | `#f43f5e` | `rgba(244, 63, 94, 0.15)` |
| Social | `#06b6d4` | `rgba(6, 182, 212, 0.15)` |

---

## Типографика

### Размеры шрифтов

| Токен | Размер |
|-------|--------|
| `--font-size-xs` | 11px |
| `--font-size-sm` | 13px |
| `--font-size-base` | 14px |
| `--font-size-md` | 15px |
| `--font-size-lg` | 16px |
| `--font-size-xl` | 18px |
| `--font-size-2xl` | 20px |
| `--font-size-3xl` | 24px |
| `--font-size-4xl` | 32px |
| `--font-size-5xl` | 40px |

### CSS классы

```html
<!-- Заголовки -->
<h1 class="heading-1">Heading 1</h1>
<h2 class="heading-2">Heading 2</h2>
<h3 class="heading-3">Heading 3</h3>

<!-- Текст -->
<p class="text-body">Body text</p>
<p class="text-body-sm">Small body text</p>
<span class="text-caption">Caption</span>
<span class="text-label">LABEL TEXT</span>

<!-- Цвета текста -->
<span class="text-primary">Primary</span>
<span class="text-secondary">Secondary</span>
<span class="text-muted">Muted</span>
<span class="text-accent">Accent</span>
```

---

## Spacing

Система отступов на базе 4px:

| Токен | Значение |
|-------|----------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

### CSS классы

```html
<!-- Margin -->
<div class="m-4">All sides</div>
<div class="mx-4">Horizontal</div>
<div class="my-4">Vertical</div>
<div class="mt-4">Top</div>
<div class="mb-4">Bottom</div>

<!-- Padding -->
<div class="p-4">All sides</div>
<div class="px-4">Horizontal</div>
<div class="py-4">Vertical</div>

<!-- Gap (для flex/grid) -->
<div class="flex gap-4">...</div>
```

---

## Border Radius

| Токен | Значение |
|-------|----------|
| `--radius-sm` | 8px |
| `--radius-md` | 12px |
| `--radius-lg` | 14px |
| `--radius-xl` | 16px |
| `--radius-2xl` | 20px |
| `--radius-3xl` | 24px |
| `--radius-4xl` | 32px |
| `--radius-full` | 9999px |

---

## Компоненты

### Кнопки

```html
<!-- Primary -->
<button class="btn btn-primary">Primary Button</button>

<!-- Secondary -->
<button class="btn btn-secondary">Secondary</button>

<!-- Ghost -->
<button class="btn btn-ghost">Ghost</button>

<!-- Icon button -->
<button class="btn-icon">
  <i data-lucide="search"></i>
</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
```

### Карточки

```html
<!-- Базовая карточка -->
<div class="card">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

<!-- Интерактивная карточка -->
<div class="card card-interactive">
  Clickable card
</div>

<!-- Glass карточка -->
<div class="card card-glass">
  Glassmorphism effect
</div>
```

### Inputs

```html
<!-- Базовый -->
<input class="input" type="text" placeholder="Enter text...">

<!-- Sizes -->
<input class="input input-sm" placeholder="Small">
<input class="input input-lg" placeholder="Large">
```

### Badges

```html
<span class="badge badge-default">Default</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
<span class="badge badge-trending">Trending</span>
```

### Dropdown

```html
<div class="dropdown-menu">
  <button class="dropdown-item">Option 1</button>
  <button class="dropdown-item active">Option 2</button>
  <button class="dropdown-item">Option 3</button>
</div>
```

### Modal

```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h3>Modal Title</h3>
    </div>
    <div class="modal-body">
      Content here
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>

<!-- Glass modal -->
<div class="modal modal-glass modal-lg">...</div>
```

### Filter Pills

```html
<div class="flex gap-2">
  <button class="filter-btn active">All</button>
  <button class="filter-btn">Games</button>
  <button class="filter-btn">Tools</button>
</div>
```

---

## Layout

### Container

```html
<div class="container">
  Max width 1152px with padding
</div>

<div class="container container-sm">640px max</div>
<div class="container container-lg">1024px max</div>
```

### Flexbox

```html
<div class="flex items-center justify-between gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

<div class="flex flex-col gap-2">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Grid

```html
<!-- Auto-fit responsive grid -->
<div class="grid-auto-fit gap-8">
  <div class="card">...</div>
  <div class="card">...</div>
  <div class="card">...</div>
</div>

<!-- Fixed columns -->
<div class="grid grid-cols-3 gap-4">...</div>
```

---

## Эффекты и анимации

### Glassmorphism

```html
<div class="glass">
  Backdrop blur effect
</div>

<div class="glass-lg">
  Stronger blur
</div>
```

### Анимации

```html
<!-- Fade in -->
<div class="animate-fade-in">Appears smoothly</div>

<!-- Scale in -->
<div class="animate-scale-in">Scales up</div>

<!-- Pulse -->
<div class="animate-pulse">Pulsing element</div>

<!-- Stagger delay -->
<div class="animate-fade-in stagger-1">First</div>
<div class="animate-fade-in stagger-2">Second</div>
<div class="animate-fade-in stagger-3">Third</div>
```

### Тени

```html
<div class="shadow-sm">Subtle shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large</div>
```

---

## Transitions

| Токен | Описание |
|-------|----------|
| `--transition-fast` | 150ms |
| `--transition-normal` | 200ms |
| `--transition-slow` | 300ms |
| `--transition-colors` | Только цвета |
| `--transition-transform` | Только transform |
| `--transition-all` | Все свойства |

```css
.my-element {
  transition: var(--transition-all);
}
```

---

## Z-Index Scale

| Токен | Значение | Использование |
|-------|----------|---------------|
| `--z-base` | 0 | Базовый уровень |
| `--z-dropdown` | 10 | Dropdown меню |
| `--z-sticky` | 20 | Sticky header |
| `--z-fixed` | 30 | Fixed elements |
| `--z-modal-backdrop` | 40 | Modal backdrop |
| `--z-modal` | 50 | Modal content |
| `--z-popover` | 60 | Popovers |
| `--z-tooltip` | 70 | Tooltips |
| `--z-toast` | 80 | Toast notifications |
| `--z-max` | 9999 | Максимальный |

---

## Темы

Переключение между темами:

```javascript
// Установить тему
document.documentElement.setAttribute('data-theme', 'light');
document.documentElement.setAttribute('data-theme', 'dark');

// Убрать атрибут для dark по умолчанию
document.documentElement.removeAttribute('data-theme');
```

Все цвета автоматически меняются через CSS переменные.

---

## Миграция

### Со старых переменных

```css
/* Старый код */
color: var(--text-primary);

/* Новый код (рекомендуется) */
color: var(--color-text-primary);
```

Legacy алиасы в `main.css` обеспечивают обратную совместимость.

### Inline-стили → CSS классы

```html
<!-- До -->
<div style="display: flex; align-items: center; gap: 16px; padding: 24px;">

<!-- После -->
<div class="flex items-center gap-4 p-6">
```

---

## Best Practices

1. **Используй токены** — не хардкодь значения
2. **Семантические имена** — `color-text-primary` вместо `#ffffff`
3. **Компонентный подход** — переиспользуй `.btn`, `.card`, `.input`
4. **Консистентность** — следуй spacing scale (4px base)
5. **Адаптивность** — используй `grid-auto-fit` для responsive layouts
6. **Touch targets** — минимум 44px для интерактивных элементов
