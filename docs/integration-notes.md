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
<!-- ANCHOR: schema-first-html -->

---

## 6. Подключения CSS/JS

**CSS:** `<link rel="stylesheet" href="assets/css/hero.css">` помещается в `<head>` **после** inline `<style>` сайта. Уже добавлено в `site_head.txt:1635`. Это критично — наш `:root { --scheme-glow: ... }` должен подгружаться позже сайтового `:root`, чтобы fallback-цепочка `var(--btn-primary-shadow-color, rgba(255,122,26,0.35))` работала корректно.

**JS:** `<script src="assets/js/hero.js" defer></script>` перед `</body>`. Для proof-bar v2 (статичная цифра) и Schema-First v2 (без count-up) реальной работы не выполняет. Полезен только для делегированного `[data-event]` tracker'а, который автоматически ловит клики на 3 кликабельные ноды (ЕГАИС, Меркурий, Честный знак). Если на проде Метрика/GA4 ещё не подключены — tracker молчит, никаких ошибок.

**Шрифты:** Oswald 400/500/600/700 + Barlow Condensed 300/400/500/600/700 уже подключены в `<head>` сайта. Не дублировать.

## 7. Архив прототипа

`_archive/index.v1.frozen.html` (commit `4021a69`) — старый прототип Turn 1, использовал классы `.hero__*` / `.btn--*` / `.stat-strip*`, которых больше нет в `hero.css` v2. Хранится только как git-history-anchor для будущего разбора версий. **Не использовать** как референс вёрстки или как тестовую страницу — он визуально сломан после rewrite.

## 8. JSON-LD на проде

В live `<head>` уже размещены два узла внутри одного `@graph` (см. `site_head.txt:38–145`):

- **Organization** — ООО «Альфа-Касса», ИНН 6506011939, ОГРН 1186501006394, Сахалинская область, телефон, email, `knowsAbout` (15 терминов: ЕГАИС, Честный знак, ГИС МТ, Меркурий, ФГИС ЛК, ФГИС Зерно, ЭДО, цифровой рубль, МЧД, СБП, 1С, АТОЛ, Frontol, маркировка, 54-ФЗ).
- **FAQPage** — 8 Question/Answer пар.

**Новой JSON-LD разметки для proof-bar / Schema-First не добавляем.** Schema-First — визуальная диаграмма архитектуры, не семантическая разметка. Подходящий тип для отдельных госсистем (`Service`) — это уровень посадочных страниц `/tsifrovye-sistemy/*`, не главная. Подробнее — §9 Roadmap пункт 4.7.

Перед добавлением ЛЮБОЙ новой JSON-LD разметки — проверять Я.Валидатор микроразметки, чтобы не задублировать существующие узлы.

## 9. Roadmap (расширенный)
<!-- ANCHOR: roadmap-notes -->

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
