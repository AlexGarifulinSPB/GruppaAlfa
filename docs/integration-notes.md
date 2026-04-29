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

## 4–9. (TODO — коммит 3b)

В следующем коммите 3b сюда добавляются:

- **§4** — Group III: 10 SVG иконок для нод (factory, store, warehouse, app-window, database, server, wine, paw-print, qr-code, receipt) + a11y-атрибуты + render-size 18×18.
- **§5** — Schema-First полный HTML snippet (3 колонки + 10 нод + overlay-SVG для connection-lines + финальный CTA + `.reveal-1..5` stagger). 3 нода с `<a href>` (ЕГАИС, Меркурий, Честный знак), 7 нод с `<div>`. Mobile chevron / desktop overlay поведение явно описано.
- **§6** — Подключения CSS/JS, font-stack, dependency check.
- **§7** — Архив `_archive/index.v1.frozen.html`, как с ним обращаться.
- **§8** — JSON-LD на проде: что уже есть (Organization + FAQPage) и почему новой разметки **не добавляем** в Hero. Service[] — в roadmap.
- **§9** — Roadmap (расширенный): 6 пунктов + 4.5 (WCAG button audit) + 4.6 (`.metrics` defaults + 24/7 removal) + 4.7 (`Service[]` JSON-LD).
- **§10** — Тестирование (`prefers-reduced-motion`, viewport breakpoints).
