# Integration notes — v2 (post-redesign)

> Этот документ заменяет v1 (см. git history, commit `b935591`). После жалобы
> заказчика на «wireframe-вид» Stat-Strip и Schema-First оба блока перерисованы
> под существующий design system сайта `gruppa-alfa.ru`.

## 0. TL;DR

| Артефакт | Версия | Статус |
|---|---|---|
| `assets/css/hero.css` | v2 | ✅ rewrite в `72acba3` + glow var в `745135c` |
| `assets/js/hero.js` | v1 | ⚠️ Count-up больше не используется (proof-bar v2 = одна статичная цифра). Файл оставляем — пригодится для будущих секций (`scheme_view` IO, делегированный tracker для CTA). |
| `_archive/index.v1.frozen.html` | v1 frozen | физически перенесён в `4021a69`. Не использовать как референс. |
| `docs/integration-notes.md` | v2 | этот файл |

**На проде меняется:**

1. Удалить ранее вставленный v1 stat-strip (если был размещён до жалобы) — там, где сейчас отрисовывается «0 внедрений / 0 дней до отчёта / 0 покрытия в сутки».
2. Вставить proof-bar (1-cell, «17 часов») — Group I в этом документе.
3. Вставить перерисованный Schema-First (3 колонки + 10 нод + декоративные connection-lines) — **полный HTML в коммите 3b** (Group III + сборка).

**На проде НЕ трогаем:**

- **Hero, в т.ч. H1** — наш scope только proof-bar и Schema-First. Существующий H1 «Подключаем бизнес к обязательным госсистемам РФ — ЕГАИС, Честный знак, Меркурий, цифровой рубль» сохраняется без изменений (4 коммерческих кластера, поисковые позиции — не наша территория).
- Шрифты (Oswald + Barlow Condensed уже подключены в `<head>`).
- Кнопки сайта (`.btn` / `.btn-primary` / `.btn-ghost`) — мы их не дублируем и не переопределяем; используем напрямую.
- Существующие секции `.metrics`, `.services`, `.systems`, `.faq`, `.process`, `.contact`, footer.
- Существующий JSON-LD блок (`Organization` + `FAQPage`).

---

## 1. Анкеры вставки

Live-`index.html` сайта собран как один файл с inline `<style>` (≈1635 строк) + inline JSON-LD + body.

| Snippet | Вставить ПОСЛЕ | Вставить ДО |
|---|---|---|
| **Group I** — proof-bar | закрывающий `</section>` секции `<section class="hero">` | открывающий `<section class="metrics">` |
| **Schema-First** (Groups II + III) | закрывающий `</section>` секции `<section class="services">` | открывающий `<section class="systems">` |

> Поместить proof-bar **внутри** `.hero` нельзя — это отдельная узкая полоска (border-top + border-bottom = идиома `.brands`), а не часть Hero-фона. Поместить **между** Hero и `.metrics` — самое место: заменяет «первое впечатление от метрик» уникальной цифрой «17ч», существующий `.metrics` (с 4 другими цифрами) идёт следом.

---

## 2. Group I — Proof-bar (1 ячейка, без JS)

### Insertion anchor

```html
<!-- … закрытие </section class="hero"> … -->

<!-- ↓↓ ВСТАВКА: Group I — proof-bar ↓↓ -->
[snippet ниже]
<!-- ↑↑ /ВСТАВКА ↑↑ -->

<!-- … <section class="metrics"> … -->
```

### Snippet

```html
<section class="proof-bar reveal">
  <div class="wrap proof-bar__inner">
    <p class="proof-bar__value">17<span class="proof-bar__unit">часов</span></p>
    <p class="proof-bar__label">покрытия в сутки · офисы в Москве и на Сахалине</p>
  </div>
</section>
```

### Требование к интеграции — real-value rule (UX-критично)

Значение `17` отрисовывается в HTML **напрямую**. Никакого `data-count-to`, никакого JS-анимирования.

Если в будущем кто-то захочет добавить count-up:

- HTML рендерится с **реальным** значением;
- JS **поверх** заменяет на `0` и анимирует обратно до реального;
- НЕ наоборот.

Это защита от UX-бага: при отказе JS / `prefers-reduced-motion: reduce` / медленном LCP — пользователь видит «17 часов покрытия» сразу, а не «0 часов покрытия» на первом экране. То же правило применить к `.metric` блоку при будущем рефакторинге (см. §3 Roadmap в коммите 3b).

### Доступность

- `.proof-bar` обёрнут в `<section>` — семантический landmark.
- Контент — текст в `<p>`, никаких иконок и интерактивности → ARIA-атрибуты не нужны.
- Цифра `17` + единица «часов» в одном `<p>` → программам экранного доступа читается как «семнадцать часов».

### Класс `.reveal`

Анимация `slideUp` (0.8s ease forwards, opacity+translateY30) применяется один раз при загрузке. Класс ставится на `<section>`, а не на внутренний контейнер. Site-CSS уже определяет keyframes; `hero.css` v2 добавляет scoped `prefers-reduced-motion` guard для `.reveal*` классов.

### Без `data-event`

На proof-bar нет интерактивных элементов → tracker'у нечего ловить.

---

## 3. Group II — Иконки колонок (3 SVG, line-art lucide-style)

Используются в `.scheme-col__icon` (48×48 wrap) внутри Schema-First секции. Полная сборка секции — в коммите 3b (Group III + вёрстка). Здесь — только сами SVG, как «иконочная библиотека» для копи-паста.

### Общие атрибуты

| Атрибут | Значение | Зачем |
|---|---|---|
| `width="24"` `height="24"` | фиксированный размер | защита от CLS при отключённом CSS |
| `viewBox="0 0 24 24"` | base grid lucide/feather | масштабируется через CSS до 26×26 |
| `fill="none"` `stroke="currentColor"` | line-art | автоматически наследует `color: var(--accent)` от родителя |
| `stroke-width="1.75"` | средняя толщина | гармонирует с `.system-card-featured` weight |
| `stroke-linecap="round"` `stroke-linejoin="round"` | мягкие концы | бренд-стиль |
| `aria-hidden="true"` `focusable="false"` | декоративность | рядом всегда есть текстовый kicker + title; экранный диктор пропускает |

> Все три — **декоративные** (`aria-hidden`). `<title>` / `role="img"` не нужны.

### II.1 — boxes (колонка «Что у вас?»)

Метафора: гетерогенный набор систем у клиента (3 разных «коробки» — 3 конфигурации 1С).

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <rect x="3" y="3" width="7" height="7" rx="1"/>
  <rect x="14" y="3" width="7" height="7" rx="1"/>
  <rect x="9" y="14" width="7" height="7" rx="1"/>
</svg>
```

### II.2 — layers (колонка «Что мы добавим?»)

Метафора: стек = слои (платформа + БД + OS).

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M12 2 2 7l10 5 10-5-10-5z"/>
  <path d="m2 17 10 5 10-5"/>
  <path d="m2 12 10 5 10-5"/>
</svg>
```

### II.3 — shield-check (колонка «Что получите?»)

Метафора: автоматическое соответствие закону = защита от штрафов.

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
  <path d="m9 12 2 2 4-4"/>
</svg>
```

---

## 4. Group III — Иконки нод (10 SVG)

Общие атрибуты — те же, что в Group II (см. §3): line-art lucide-style, `viewBox="0 0 24 24"`, `stroke="currentColor"`, `stroke-width="1.75"`, round caps, `aria-hidden="true"`, `focusable="false"`. Render-size в CSS — 18×18 (через `.scheme-node__icon svg { width: 18px; height: 18px; }`).

**Кликабельность:** 3 ноды (★) — `<a href>` с `data-event` для tracker'а. 7 нод — `<div>` без href и без `data-event`.

### III.1 — factory (1С:ERP — производство и крупный учёт)
SVG (рисунок: фабричное здание с трубами):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
  <path d="M17 18h1"/>
  <path d="M12 18h1"/>
  <path d="M7 18h1"/>
</svg>
```

HTML node (некликабельный):

```html
<li class="scheme-node">
  <span class="scheme-node__icon">
    <!-- SVG III.1 factory сюда -->
  </span>
  <span class="scheme-node__body">
    <span class="scheme-node__term">1С:ERP</span>
    <span class="scheme-node__benefit">производство и крупный учёт</span>
  </span>
</li>
```

### III.2 — store (1С:Розница — автоматизация магазинов и касс)
SVG (рисунок: магазин с навесом):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
  <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
  <path d="M2 7h20"/>
</svg>
```

HTML node (некликабельный):

```html
<li class="scheme-node">
  <span class="scheme-node__icon">
    <!-- SVG III.2 store сюда -->
  </span>
  <span class="scheme-node__body">
    <span class="scheme-node__term">1С:Розница</span>
    <span class="scheme-node__benefit">автоматизация магазинов и касс</span>
  </span>
</li>
```

### III.3 — warehouse (1С:УТ — управление оптовой торговлей)
SVG (рисунок: склад с ящиком внутри):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/>
  <rect x="6" y="10" width="12" height="12" rx="1"/>
  <path d="M6 14h12"/>
  <path d="M6 18h12"/>
</svg>
```

HTML node (некликабельный):

```html
<li class="scheme-node">
  <span class="scheme-node__icon">
    <!-- SVG III.3 warehouse сюда -->
  </span>
  <span class="scheme-node__body">
    <span class="scheme-node__term">1С:УТ</span>
    <span class="scheme-node__benefit">управление оптовой торговлей</span>
  </span>
</li>
```

### III.4 — app-window (1С Платформа — актуальная версия с лицензиями)
SVG (рисунок: окно приложения с тулбаром):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <rect x="2" y="4" width="20" height="16" rx="2"/>
  <path d="M2 8h20"/>
  <path d="M6 6h.01"/>
  <path d="M10 6h.01"/>
  <path d="M14 6h.01"/>
</svg>
```

HTML node (некликабельный):

```html
<li class="scheme-node">
  <span class="scheme-node__icon">
    <!-- SVG III.4 app-window сюда -->
  </span>
  <span class="scheme-node__body">
    <span class="scheme-node__term">1С Платформа</span>
    <span class="scheme-node__benefit">актуальная версия с лицензиями</span>
  </span>
</li>
```

### III.5 — database (PostgreSQL — БД без затрат на лицензии)
SVG (рисунок: база данных — цилиндр):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <ellipse cx="12" cy="5" rx="9" ry="3"/>
  <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
  <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
</svg>
```

HTML node (некликабельный):

```html
<li class="scheme-node">
  <span class="scheme-node__icon">
    <!-- SVG III.5 database сюда -->
  </span>
  <span class="scheme-node__body">
    <span class="scheme-node__term">PostgreSQL</span>
    <span class="scheme-node__benefit">база данных без затрат на лицензии</span>
  </span>
</li>
```

### III.6 — server (Linux-серверы — стабильная инфраструктура 24×7)
SVG (рисунок: серверная стойка из 2 слотов):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <rect x="2" y="2" width="20" height="8" rx="2"/>
  <rect x="2" y="14" width="20" height="8" rx="2"/>
  <path d="M6 6h.01"/>
  <path d="M6 18h.01"/>
</svg>
```

HTML node (некликабельный):

```html
<li class="scheme-node">
  <span class="scheme-node__icon">
    <!-- SVG III.6 server сюда -->
  </span>
  <span class="scheme-node__body">
    <span class="scheme-node__term">Linux-серверы</span>
    <span class="scheme-node__benefit">стабильная инфраструктура 24×7</span>
  </span>
</li>
```

### III.7 — wine (ЕГАИС — продажа алкоголя без блокировки) ★ кликабельная
SVG (рисунок: винный бокал с подставкой):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M8 22h8"/>
  <path d="M7 10h10"/>
  <path d="M12 15v7"/>
  <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>
</svg>
```

HTML node (★ кликабельная — `<a href>`, `data-event`):

```html
<li class="scheme-node">
  <a class="scheme-node__link"
     href="/tsifrovye-sistemy/egais/"
     data-event="schema_node_egais">
    <span class="scheme-node__icon">
      <!-- SVG III.7 wine сюда -->
    </span>
    <span class="scheme-node__body">
      <span class="scheme-node__term">ЕГАИС</span>
      <span class="scheme-node__benefit">продажа алкоголя без блокировки</span>
    </span>
  </a>
</li>
```

> Note: класс `.scheme-node__link` — для будущей возможности отдельных hover-стилей на ссылочной ноде. Если в `hero.css` нет правил для него — просто наследует поведение `.scheme-node` (`display: flex`, `gap: 12px`, etc).

### III.8 — paw-print (Меркурий — ветеринарные сертификаты автоматом) ★ кликабельная
SVG (рисунок: отпечаток лапы — 4 пальца + подушечка):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <circle cx="11" cy="4" r="2"/>
  <circle cx="18" cy="8" r="2"/>
  <circle cx="20" cy="16" r="2"/>
  <circle cx="4" cy="12" r="2"/>
  <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 1 1-7 0V15a5 5 0 0 1 2-5Z"/>
</svg>
```

HTML node (★ кликабельная — `<a href>`, `data-event`):

```html
<li class="scheme-node">
  <a class="scheme-node__link"
     href="/tsifrovye-sistemy/merkuriy/"
     data-event="schema_node_merkuriy">
    <span class="scheme-node__icon">
      <!-- SVG III.8 paw-print сюда -->
    </span>
    <span class="scheme-node__body">
      <span class="scheme-node__term">Меркурий</span>
      <span class="scheme-node__benefit">ветеринарные сертификаты автоматом</span>
    </span>
  </a>
</li>
```

### III.9 — qr-code (Честный знак — маркировка без риска штрафов) ★ кликабельная
SVG (рисунок: QR-код — три угловых маркера):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <rect x="3" y="3" width="5" height="5" rx="1"/>
  <rect x="16" y="3" width="5" height="5" rx="1"/>
  <rect x="3" y="16" width="5" height="5" rx="1"/>
  <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
  <path d="M21 21v.01"/>
  <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
  <path d="M12 16h.01"/>
  <path d="M16 12h1"/>
  <path d="M21 12v.01"/>
  <path d="M12 21v-1"/>
</svg>
```

HTML node (★ кликабельная — `<a href>`, `data-event`):

```html
<li class="scheme-node">
  <a class="scheme-node__link"
     href="/tsifrovye-sistemy/chestnyy-znak/"
     data-event="schema_node_chestnyy_znak">
    <span class="scheme-node__icon">
      <!-- SVG III.9 qr-code сюда -->
    </span>
    <span class="scheme-node__body">
      <span class="scheme-node__term">Честный знак</span>
      <span class="scheme-node__benefit">маркировка без риска штрафов</span>
    </span>
  </a>
</li>
```

### III.10 — receipt (ФФД 1.2 — кассовые чеки по последнему стандарту)
SVG (рисунок: чек с зубчатым нижним краем + знак рубля):

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
  <path d="M12 17.5v-11"/>
</svg>
```

HTML node (некликабельный — посадочной страницы для ФФД 1.2 нет):

```html
<li class="scheme-node">
  <span class="scheme-node__icon">
    <!-- SVG III.10 receipt сюда -->
  </span>
  <span class="scheme-node__body">
    <span class="scheme-node__term">ФФД 1.2</span>
    <span class="scheme-node__benefit">кассовые чеки по последнему стандарту</span>
  </span>
</li>
```

---

## 5. Schema-First — полный HTML snippet
### Insertion anchor

```html
<!-- … закрытие </section class="services"> … -->

<!-- ↓↓ ВСТАВКА: Schema-First (Groups II + III + overlay-SVG + CTA) ↓↓ -->
[snippet ниже]
<!-- ↑↑ /ВСТАВКА ↑↑ -->

<!-- … <section class="systems"> … -->
```

### Полный snippet

```html
<section class="scheme">
  <div class="wrap">

    <header class="section-head reveal">
      <div>
        <p class="section-kicker">Архитектура</p>
        <h2 class="section-title">От учётной системы — к&nbsp;<span class="accent">госконтуру</span></h2>
      </div>
      <p class="section-lead">Один стек обслуживает все обязательные интеграции. Не «зоопарк подрядчиков», а сквозная архитектура от&nbsp;1С до&nbsp;ОФД.</p>
    </header>

    <div class="scheme__diagram">

      <!-- Декоративные connection-lines: desktop ≥1024 only (CSS управляет видимостью) -->
      <svg class="scheme__lines" viewBox="0 0 1320 480" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <line x1="32%" y1="50%" x2="35%" y2="50%" stroke="var(--purple-light)" stroke-width="2" stroke-dasharray="3 6" opacity="0.45"/>
        <circle cx="32%" cy="50%" r="3" fill="var(--purple-light)"/>
        <circle cx="35%" cy="50%" r="3" fill="var(--accent)"/>
        <line x1="65%" y1="50%" x2="68%" y2="50%" stroke="var(--purple-light)" stroke-width="2" stroke-dasharray="3 6" opacity="0.45"/>
        <circle cx="65%" cy="50%" r="3" fill="var(--purple-light)"/>
        <circle cx="68%" cy="50%" r="3" fill="var(--accent)"/>
      </svg>

      <!-- ===== Колонка 1: Что у вас? ===== -->
      <article class="scheme-col reveal-1" data-lane="input">
        <span class="scheme-col__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="9" y="14" width="7" height="7" rx="1"/>
          </svg>
        </span>
        <p class="scheme-col__kicker">Что у вас?</p>
        <h3 class="scheme-col__title">Любая 1С</h3>
        <p class="scheme-col__lede">Поддерживаем все конфигурации — типовые и отраслевые.</p>
        <ul class="scheme-col__nodes">
          <li class="scheme-node">
            <span class="scheme-node__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>
            </span>
            <span class="scheme-node__body">
              <span class="scheme-node__term">1С:ERP</span>
              <span class="scheme-node__benefit">производство и крупный учёт</span>
            </span>
          </li>
          <li class="scheme-node">
            <span class="scheme-node__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
            </span>
            <span class="scheme-node__body">
              <span class="scheme-node__term">1С:Розница</span>
              <span class="scheme-node__benefit">автоматизация магазинов и касс</span>
            </span>
          </li>
          <li class="scheme-node">
            <span class="scheme-node__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><rect x="6" y="10" width="12" height="12" rx="1"/><path d="M6 14h12"/><path d="M6 18h12"/></svg>
            </span>
            <span class="scheme-node__body">
              <span class="scheme-node__term">1С:УТ</span>
              <span class="scheme-node__benefit">управление оптовой торговлей</span>
            </span>
          </li>
        </ul>
      </article>

      <!-- ===== Колонка 2: Что мы добавим? ===== -->
      <article class="scheme-col reveal-2" data-lane="stack">
        <span class="scheme-col__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M12 2 2 7l10 5 10-5-10-5z"/>
            <path d="m2 17 10 5 10-5"/>
            <path d="m2 12 10 5 10-5"/>
          </svg>
        </span>
        <p class="scheme-col__kicker">Что мы добавим?</p>
        <h3 class="scheme-col__title">Серверы, базы, сеть</h3>
        <p class="scheme-col__lede">Развернём и сопровождаем под ключ.</p>
        <ul class="scheme-col__nodes">
          <li class="scheme-node">
            <span class="scheme-node__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/><path d="M6 6h.01"/><path d="M10 6h.01"/><path d="M14 6h.01"/></svg>
            </span>
            <span class="scheme-node__body">
              <span class="scheme-node__term">1С Платформа</span>
              <span class="scheme-node__benefit">актуальная версия с лицензиями</span>
            </span>
          </li>
          <li class="scheme-node">
            <span class="scheme-node__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>
            </span>
            <span class="scheme-node__body">
              <span class="scheme-node__term">PostgreSQL</span>
              <span class="scheme-node__benefit">база данных без затрат на лицензии</span>
            </span>
          </li>
          <li class="scheme-node">
            <span class="scheme-node__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/></svg>
            </span>
            <span class="scheme-node__body">
              <span class="scheme-node__term">Linux-серверы</span>
              <span class="scheme-node__benefit">стабильная инфраструктура 24×7</span>
            </span>
          </li>
        </ul>
      </article>

      <!-- ===== Колонка 3: Что получите? ===== -->
      <article class="scheme-col reveal-3" data-lane="integrations">
        <span class="scheme-col__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </span>
        <p class="scheme-col__kicker">Что получите?</p>
        <h3 class="scheme-col__title">Соответствие закону</h3>
        <p class="scheme-col__lede">Автоматически, без штрафов.</p>
        <ul class="scheme-col__nodes">
          <li class="scheme-node">
            <a class="scheme-node__link" href="/tsifrovye-sistemy/egais/" data-event="schema_node_egais">
              <span class="scheme-node__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>
              </span>
              <span class="scheme-node__body">
                <span class="scheme-node__term">ЕГАИС</span>
                <span class="scheme-node__benefit">продажа алкоголя без блокировки</span>
              </span>
            </a>
          </li>
          <li class="scheme-node">
            <a class="scheme-node__link" href="/tsifrovye-sistemy/merkuriy/" data-event="schema_node_merkuriy">
              <span class="scheme-node__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><circle cx="4" cy="12" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 1 1-7 0V15a5 5 0 0 1 2-5Z"/></svg>
              </span>
              <span class="scheme-node__body">
                <span class="scheme-node__term">Меркурий</span>
                <span class="scheme-node__benefit">ветеринарные сертификаты автоматом</span>
              </span>
            </a>
          </li>
          <li class="scheme-node">
            <a class="scheme-node__link" href="/tsifrovye-sistemy/chestnyy-znak/" data-event="schema_node_chestnyy_znak">
              <span class="scheme-node__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M12 16h.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
              </span>
              <span class="scheme-node__body">
                <span class="scheme-node__term">Честный знак</span>
                <span class="scheme-node__benefit">маркировка без риска штрафов</span>
              </span>
            </a>
          </li>
          <li class="scheme-node">
            <span class="scheme-node__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>
            </span>
            <span class="scheme-node__body">
              <span class="scheme-node__term">ФФД 1.2</span>
              <span class="scheme-node__benefit">кассовые чеки по последнему стандарту</span>
            </span>
          </li>
        </ul>
      </article>

    </div>

    <div class="scheme__cta reveal-4">
      <a class="btn btn-primary" href="#contact" data-event="schema_cta_audit_inline">
        Заказать аудит инфраструктуры
        <span class="btn-arrow" aria-hidden="true">→</span>
      </a>
    </div>

  </div>
</section>
```

### Заметки по интеграции

- **CTA href:** `#contact` — анкер на существующую секцию `<section class="contact">` в live `<head>` сайта.<sub> исторически — `site_head.txt:1232 @ 4c7db1f`</sub> Если у этой секции на проде нет `id="contact"` — добавить или поправить href под фактический id формы.
- **Reveal stagger:** `header(reveal)` → `input(reveal-1)` → `stack(reveal-2)` → `integrations(reveal-3)` → `cta(reveal-4)`. Ноды без stagger — наследуют родительский fade колонки.
- **Mobile / desktop split:** overlay-SVG `.scheme__lines` управляется CSS — `display: none` ниже 1024 px, `display: block` от 1024. Mobile-chevron между колонками — наоборот, виден ≤1023, скрыт ≥1024. Никакого JS.
- **`data-event`:** 4 точки трекинга — 3 ноды (egais/merkuriy/chestnyy_znak) + финальный CTA. Делегированный tracker в `assets/js/hero.js` ловит автоматически.
- **`aria-hidden="true"` на иконках** — все 13 декоративные. Если в будущем нода без видимого текста — добавить `<title>` внутрь SVG и `role="img"`.

---

## 6. Подключения CSS/JS

**CSS:** `<link rel="stylesheet" href="assets/css/hero.css">` помещается в `<head>` **после** inline `<style>` сайта — в самом конце `<head>`, последней строкой перед `</head>`.<sub> исторически — `site_head.txt:1635 @ 4c7db1f`</sub> Это критично — наш `:root { --scheme-glow: ... }` должен подгружаться позже сайтового `:root`, чтобы fallback-цепочка `var(--btn-primary-shadow-color, rgba(255,122,26,0.35))` работала корректно.

**JS:** `<script src="assets/js/hero.js" defer></script>` перед `</body>`. Для proof-bar v2 (статичная цифра) и Schema-First v2 (без count-up) реальной работы не выполняет. Полезен только для делегированного `[data-event]` tracker'а, который автоматически ловит клики на 3 кликабельные ноды (ЕГАИС, Меркурий, Честный знак). Если на проде Метрика/GA4 ещё не подключены — tracker молчит, никаких ошибок.

**Шрифты:** Oswald 400/500/600/700 + Barlow Condensed 300/400/500/600/700 уже подключены в `<head>` сайта. Не дублировать.

## 7. Архив прототипа

`_archive/index.v1.frozen.html` (commit `4021a69`) — старый прототип Turn 1, использовал классы `.hero__*` / `.btn--*` / `.stat-strip*`, которых больше нет в `hero.css` v2. Хранится только как git-history-anchor для будущего разбора версий. **Не использовать** как референс вёрстки или как тестовую страницу — он визуально сломан после rewrite.

## 8. JSON-LD на проде

В live `<head>` уже размещены два узла внутри одного `@graph` (inline `<script type="application/ld+json">` рядом с другими meta-тегами):<sub> исторически — `site_head.txt:38–145 @ 4c7db1f`</sub>

- **Organization** — ООО «Альфа-Касса», ИНН 6506011939, ОГРН 1186501006394, Сахалинская область, телефон, email, `knowsAbout` (15 терминов: ЕГАИС, Честный знак, ГИС МТ, Меркурий, ФГИС ЛК, ФГИС Зерно, ЭДО, цифровой рубль, МЧД, СБП, 1С, АТОЛ, Frontol, маркировка, 54-ФЗ).
- **FAQPage** — 8 Question/Answer пар.

**Новой JSON-LD разметки для proof-bar / Schema-First не добавляем.** Schema-First — визуальная диаграмма архитектуры, не семантическая разметка. Подходящий тип для отдельных госсистем (`Service`) — это уровень посадочных страниц `/tsifrovye-sistemy/*`, не главная. Подробнее — §9 Roadmap пункт 4.7.

Перед добавлением ЛЮБОЙ новой JSON-LD разметки — проверять Я.Валидатор микроразметки, чтобы не задублировать существующие узлы.

## 9. Roadmap (расширенный)
### Изначальный roadmap (из v1, актуально)

1. `.systems` → переверстать в карточки с метриками (на проде уже сделано через `.system-card-featured` + `.system-card-compact` — оставлено для возможного дальнейшего рефакторинга).
2. `.faq` → структурировать по категориям (биллинг, интеграции, поддержка). На проде — простой плоский список из 8 вопросов.
3. **Кейсы** — новая секция между `.scheme` и `.systems`. Не реализовано.
4. **Performance / LCP optimization** — preload Hero-картинки, font-display, critical CSS. Не реализовано.
5. **152-ФЗ compliance — приоритет №1** (см. чек-лист ниже).
6. `.partners` — почистить логотипы партнёров до качественных SVG.

### Дополнительные пункты (после redesign v2)

#### 4.5 — WCAG button audit (architectural pass)

На сайте `.btn-primary` использует `color: var(--ink)` (белый текст) на оранжевом фоне `--accent` — контраст 2.61:1, **fail WCAG AA** (требуется ≥4.5:1).

Также на сайте есть `.tg-btn` (Telegram-голубой #0088cc + белый текст) и `.call-phone-btn` (тот же оранжевый pattern).

**Задача:** комплексный pass по всем кнопкам сайта — заменить белый текст на тёмный (`#1a1030`) или подобрать другой brand-цвет с контрастом ≥4.5:1. Затрагивает:

- `.btn-primary` (Hero, Schema-First CTA, Call-CTA)
- `.call-phone-btn` (Call-CTA right column)
- `.nav-phone` (sticky navbar)
- `.tg-btn` (отдельный анализ — голубой+белый = 4.51:1, граница AA, на этой паре можно оставить)

Не делать точечно — аккуратно через `--accent-text-on-orange` token, чтобы поменять одной правкой `:root`.

#### 4.6 — `.metrics` block real defaults + 24/7 removal

В существующем блоке `.metrics` сейчас (предположительно — по жалобе заказчика) отрисовываются нули как плейсхолдеры под count-up. Это UX-баг (см. §2 real-value rule). Также там есть «24/7» — юр-риск, см. CLAUDE.md.

**Задачи:**

- В HTML `.metric-num` подставить реальные значения сразу (`200+`, `7`, etc), а не `0`.
- JS-анимирование count-up (если используется) — переписать так: парсит `data-count-to` ИЛИ итоговое значение из `textContent`, в начале анимации меняет на `0`, анимирует обратно. При `prefers-reduced-motion: reduce` — не трогает HTML вообще.
- **«24/7» в `.metric` удалить.** Заменить на «17 ч» (то же значение, что в proof-bar) с подписью, согласованной с CLAUDE.md.
- Если в HTML/JSON-LD/meta-description ещё где-то есть «24/7» / «круглосуточно» — поправить везде. Это не косметика, это compliance (РФ-юрлицо, ложное обещание услуг).

#### 4.7 — `Service[]` JSON-LD (audit пройден, отдельная задача)

Audit прод-`<head>` (снапшот 1635 строк, выполнен на коммите `4c7db1f`): **на момент проверки на проде нет** `"@type": "Service"`. Существующий `@graph` содержит только `Organization` (с `knowsAbout`-массивом из 15 терминов) и `FAQPage` (8 Q/A).

**Задача:** при развитии посадочных `/tsifrovye-sistemy/{egais,chestnyy-znak,merkuriy,...}` добавить на каждой посадочной свой `Service` узел внутри `@graph`, с `provider: { "@id": "https://gruppa-alfa.ru/#organization" }` (ссылка на главный Organization).

Шаблон узла `Service`:

```json
{
  "@type": "Service",
  "@id": "https://gruppa-alfa.ru/tsifrovye-sistemy/egais/#service",
  "name": "Подключение к ЕГАИС",
  "provider": { "@id": "https://gruppa-alfa.ru/#organization" },
  "areaServed": "RU",
  "serviceType": "Интеграция с государственной системой",
  "termsOfService": "https://gruppa-alfa.ru/terms/"
}
```

**Не делать на главной** — `Service` без посадочной = висящая ссылка для краулера.

#### 4.8 — Pre-deploy gate: посадочные `/tsifrovye-sistemy/*/` отдают 200

Перед деплоем hero/scheme на прод **обязательно** проверить из браузера или внешнего curl, что 3 кликабельные ноды схемы не ведут в 404:

```bash
curl -sI https://gruppa-alfa.ru/tsifrovye-sistemy/egais/         | head -1
curl -sI https://gruppa-alfa.ru/tsifrovye-sistemy/merkuriy/      | head -1
curl -sI https://gruppa-alfa.ru/tsifrovye-sistemy/chestnyy-znak/ | head -1
```

Все 3 = `HTTP/* 200` → деплой как есть. Хотя бы один ≠ 200 → перед копипастом §5 деградировать соответствующий `<a href="...">` → `<div>` (без href), кликабельность вернуть отдельным коммитом после готовности страницы. Из dev-окружения Claude Code проверка невозможна (egress proxy блокирует `gruppa-alfa.ru` → 403 host_not_allowed) — гейт исполняется человеком.

### 152-ФЗ compliance (preserved из v1)

- [ ] Privacy-policy страница (`/privacy` или `/personal-data-policy`).
- [ ] Cookie/data-consent banner **ДО** загрузки Метрики/GA4.
- [ ] Checkbox согласия на каждой форме сайта (не «нажимая кнопку»).
- [ ] В политике: оператор ПДн = юрлицо + ИНН + ОГРН (ООО «Альфа-Касса», ИНН 6506011939, ОГРН 1186501006394 — уже в JSON-LD `Organization`).
- [ ] Email для запросов субъектов ПДн.
- [ ] Регистрация в Роскомнадзоре как оператор ПДн.

---

## 10. Тестирование

### prefers-reduced-motion

1. Chrome DevTools → `Ctrl+Shift+P` → «Show Rendering».
2. «Emulate CSS media feature `prefers-reduced-motion`» → `reduce`.
3. Перезагрузить страницу.

Ожидаемое поведение:

- `.proof-bar` появляется без `slideUp` (мгновенно, opacity 1).
- `.scheme-col` (3 колонки) — без stagger, появляются мгновенно.
- Hover-переходы на карточках сайта (`.system-card-featured` и т. п.) **остаются включёнными** — это site DS, наш scope их не отключает (см. CLAUDE.md / a11y-baseline).

### Viewport breakpoints

| Ширина | Поведение |
|---|---|
| ≤640 px | proof-bar: цифра + label вертикально (`flex-wrap: wrap`). |
| ≤1023 px | Schema: 1 колонка, между парами — chevron вниз. Overlay-SVG скрыт (`display: none`). |
| ≥1024 px | Schema: 3 колонки, chevron'ы скрыты, overlay-SVG виден (декоративные connection-lines). |

---

## 11. Environment & rollback notes

### Constraint: tag push from Claude Code dev environment

Proxy Claude GitHub App (`http://local_proxy@127.0.0.1:.../`) returns
HTTP 403 on any push targeting `refs/tags/*`, regardless of refspec form
(`<tagname>`, `refs/tags/<tagname>`, `--tags`). Branches push fine
through the same proxy.

**Implication:** annotated tags created inside Claude Code sessions
cannot be published to origin from that environment. Options:

1. Create tag locally in dev-session for documentation, do not push —
   accept "tag exists locally only" as known state.
2. Recreate and push tag from a developer's local machine with direct
   GitHub access (outside Claude Code).
3. Skip tags entirely, use commit SHAs as release identifiers (current
   choice for redesign v2).

Do not waste time trying alternative refspec forms — all tested forms
return 403.

### Redesign v2 release identifier

Since no `redesign-v2-ready` tag exists on origin, the canonical
identifier for "redesign v2 ready for prod deploy" state is commit SHA:

```
450b8c4  chore: drop site CSS snapshot  (HEAD of redesign v2)
```

Verify before deploy:

```bash
git rev-parse HEAD
# Must equal 450b8c4...
```

### Rollback recipe (if pre-flight fails or prod regression detected)

Pre-redesign state is fixed at commit:

```
4c7db1f  Add files via upload
```

Full redesign v2 spans 7 commits, from `72acba3` (Turn 5 start) through
`450b8c4` (Turn 7 end). To roll back to pre-redesign state:

```bash
# Hard reset (destructive — only if working tree clean)
git reset --hard 4c7db1f

# Or revert as new commits (preserves history, safer for shared branches)
git revert --no-commit 72acba3..450b8c4
git commit -m "revert: roll back redesign v2 (pre-flight regression)"
```

For partial rollback (e.g., keep CSS rewrite from Turn 5 but revert
documentation from Turn 6/7), revert specific commits in reverse order.
See full commit list in `redesign-v2-ready` tag annotation (local
only, not on origin).

### Pre-deploy checklist anchor

Active gates before prod deploy (detail in §9 roadmap items 4.1–4.8):

- [ ] Lighthouse mobile: CLS ≤ 0.1, LCP ≤ 2.5s
- [ ] validator.schema.org: 0 errors on Organization + FAQPage
- [ ] Yandex.Webmaster: микроразметка валидна, "Просмотр глазами Яндекса"
      рендерит scheme в SSR
- [ ] W3C HTML validator on `/`: 0 errors
- [ ] `curl -I /tsifrovye-sistemy/{egais,merkuriy,chestnyy-znak}/` = 200
      (gate 4.8, human-executed — Claude Code egress blocks the domain)
- [ ] Service[] JSON-LD: NOT added until landing pages mature (gate 4.7)
