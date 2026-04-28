# Integration notes — Hero / Stat-Strip / Schema-First

Инструкция для верстальщика. Прототип — три файла: `index.html`,
`assets/css/hero.css`, `assets/js/hero.js`. Все классы используют BEM,
JS — vanilla, no build-step.

## 1. Что куда вставлять

В существующий `index.html` сайта [gruppa-alfa.ru](https://gruppa-alfa.ru)
**ПОСЛЕ** `<header>`/`<nav>` и **ДО** существующих секций
`.metrics` / `.systems` / `.faq`:

```
<header>...</header>
<nav>...</nav>

<!-- ↓ вставляем сюда три секции из прототипа ↓ -->
<section class="hero">…</section>
<section class="stat-strip">…</section>
<section class="scheme" id="scheme">…</section>
<!-- ↑ конец вставки ↑ -->

<section class="metrics">…</section>   <!-- существующее -->
<section class="systems">…</section>   <!-- существующее -->
<section class="faq">…</section>       <!-- существующее -->
```

Подключения:
- `<link rel="stylesheet" href="assets/css/hero.css">` — в `<head>`
  **после** существующего CSS сайта (чтобы наши `:root` дополнения
  не были перебиты).
- `<script src="assets/js/hero.js" defer></script>` — перед `</body>`.
- Google Fonts `<link>` — в `<head>` (см. п. 2).

> ⚠️ `index.html` в репо — **прототип** для просмотра и тестирования
> в изоляции, **не** замена production-сайта. На прод копируются
> только три блока + два ассет-файла.

## 2. Зависимости

**Шрифты:** Oswald 500/700 + Barlow Condensed 400/500/600
(если на сайте уже подключены — пропустить):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Barlow+Condensed:wght@400;500;600&display=swap">
```

**CSS-переменные:** существующие токены сайта (`--bg`, `--ink`,
`--accent`, `--purple-*`) дублируются в `hero.css` для standalone-просмотра
прототипа. **При интеграции** — удалить из `hero.css :root` всё, что
уже задано в основном CSS сайта. Оставить только новые токены:
`--accent-text`, `--accent-hover`, `--accent-active`,
`--surface-card`, `--surface-elev`, `--border-subtle`,
`--border-strong`, `--focus-ring`, `--container-max`, `--space-section`.

**JS-зависимостей нет.** Vanilla JS, zero npm, поддержка ES5+
(`var`, `function expression`, `Array.forEach`).

## 3. TODO перед продом

- [ ] Заменить `XXXXXXXX` → реальный Метрика counter ID (8 цифр,
      создать на https://metrika.yandex.ru/list) — **2 места** в `index.html`:
      строка `ym(XXXXXXXX, "init", …)` и `noscript`-fallback URL.
- [ ] Заменить `G-XXXXXXX` → реальный GA4 measurement ID
      (создать на https://analytics.google.com) — **2 места** в `index.html`:
      `<script async src="…?id=G-XXXXXXX">` и `gtag('config', 'G-XXXXXXX')`.
- [ ] Заменить `YM_COUNTER_ID = 0` в `assets/js/hero.js` на реальный ID.
- [ ] Заменить `https://t.me/` (secondary CTA) на реальный URL
      Telegram-бота с опросом.
- [ ] Создать `<section id="audit-form">` с формой заявки.
      **Обязательно:** отдельный `<input type="checkbox" required>`
      с согласием на обработку ПДн (152-ФЗ — нельзя «нажимая кнопку»).
- [ ] Снять comment-wrapper с Метрики и GA4 в `<head>`, обернуть их
      в **cookie-consent gate** (загружать `tag.js` / `gtag.js` только
      после явного согласия пользователя).
- [ ] **152-ФЗ compliance** (юридически обязательно):
  - [ ] Страница `/privacy` (Политика обработки ПДн).
  - [ ] Cookie/data-consent banner **ДО** загрузки Метрики/GA4.
  - [ ] Checkbox согласия на каждой форме сайта.
  - [ ] В политике: оператор ПДн = юрлицо + ИНН + ОГРН
        (ООО «Альфа-Касса» / ООО «Альфа-Трейд» — см. брендбук 2019).
  - [ ] Email для запросов субъектов ПДн.
  - [ ] Регистрация в Роскомнадзоре как оператор ПДн.
- [ ] Проверить актуальность цифр Stat-Strip (200+, 7, 17ч)
      каждый квартал, обновлять `data-count-to`.
- [ ] **Заменить «поддержка 24/7» НА ВСЁМ САЙТЕ** на
      «17 часов покрытия в сутки» — текущая формулировка ложна
      (юр-риск для РФ-юрлица).
- [ ] (Опционально) Заменить CSS-chevron между колонками Schema-First
      на дизайн-SVG, если нужен брендированный вид.
- [ ] Brand SVGs: сейчас лежат в `public/brand/logo-color.svg` и
      `logo-mono.svg` (артефакт ранней React-гипотезы). На vanilla-сайте
      перенести в `assets/img/` или иное стандартное место и обновить
      пути при интеграции.

## 4. Как тестировать count-up локально

1. Запустить статик-сервер из корня репо:
   ```
   python3 -m http.server 8000
   # или: npx serve .
   # или VS Code → Live Server
   ```
2. Открыть `http://localhost:8000/`.
3. Прокрутить до Stat-Strip — три цифры считают `0 → 200+ / 0 → 7 / 0 → 17ч`
   за ~800 ms (ease-out).
4. Если не считает — открыть DevTools → Console:
   - `Uncaught ReferenceError` → проверить путь к `assets/js/hero.js`.
   - Цифры остаются на `0` → Stat-Strip не вошёл во viewport
     (threshold 0.3 — должно быть видно ≥30% секции).

## 5. Как тестировать prefers-reduced-motion

1. Chrome DevTools → `Ctrl+Shift+P` → «Show Rendering».
2. В нижней панели «Rendering»: «Emulate CSS media feature
   `prefers-reduced-motion`» → выбрать `reduce`.
3. Перезагрузить страницу.
4. Ожидаемое:
   - Stat-Strip: цифры показывают финальное значение **сразу**,
     без счёта.
   - CTA-кнопки: hover не сдвигает стрелку (`.btn__arrow`).
   - Все CSS `transition` отключены.
5. Альтернатива в OS: macOS → Settings → Accessibility → Display →
   Reduce motion. Windows → Settings → Accessibility → Visual effects
   → Animation effects (off).

## Bonus: Roadmap (из CLAUDE.md)

1. `.systems` → переверстать в карточки с метриками.
2. `.faq` → структурировать по категориям (биллинг, интеграции,
   поддержка и т. п.).
3. Кейсы — новая секция между `.scheme` и `.systems`.
4. Performance / LCP optimization — preload Hero-картинки,
   font-display, critical CSS.
5. **152-ФЗ compliance** — приоритет №1 (см. чек-лист выше).
6. `.partners` — почистить логотипы партнёров до качественных SVG
   (сейчас разнородные растры).
