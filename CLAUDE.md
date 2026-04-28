# CLAUDE.md — Контекст проекта GruppaAlfa

## Что это

Hero-секция и сопутствующие блоки для сайта gruppa-alfa.ru.
Сайт = чистый HTML+CSS+vanilla JS (не React, не CMS).
Цель: добавить новые секции (Stat-Strip, Schema-First) и улучшить
Hero без переделки всего сайта.

## Состояние работы (на момент создания файла)

- ✅ `docs/accessibility-baseline.md` committed (`194b29b`)
- ✅ Brand SVGs in `public/brand/` (`c6f7c31`) — заметка: путь
  сложился ещё на этапе React-предположения; для vanilla сайта
  при интеграции возможно нужно перенести в `assets/img/` или
  иное стандартное место. Решить при подключении в C.
- ✅ Аудит существующего Hero сделан (раздел A в чате)
- ✅ План B утверждён (с правками от user)
- ⏳ Раздел C — генерация кода **не начата** из-за timeout'ов
  в предыдущих сессиях

## Стек сайта (определён через DevTools пользователем)

- HTML5 + CSS3 + vanilla JS, без CMS
- CSS-переменные в `:root`:
  - `--bg #1a1030`, `--ink #ffffff`, `--accent #ff7a1a`
  - `--purple-deep #3d2963`, `--purple-brand #6b4a9e`
  - `--purple-mid #7a5bb0`, `--purple-light #a890d4`
  - `--purple-pale #e8ddf5`
- Шрифты: Oswald (display) + Barlow Condensed (body)
- Тёмная палитра, существующая constellation-графика на фоне

## Что генерируем в разделе C (4 файла)

1. `index.html` — прототип со всеми блоками
2. `assets/css/hero.css` — стили + новые `:root` переменные
3. `assets/js/hero.js` — count-up, IntersectionObserver, delegated tracker
4. `docs/integration-notes.md` — инструкция для верстальщика

## Финальные решения user (НЕ переспрашивать)

### CTA-стратегия Z (two-branch)

- **Primary:** «Заказать аудит инфраструктуры →» (filled orange CTA)
  - Микро-копирайт: «Платно. 7 дней до отчёта.»
- **Secondary:** «Пройти опрос в Telegram» (ghost CTA, white border)
  - Микро-копирайт: «Бесплатно. 2 минуты. Подберём решение и смету.»
- **Tertiary:** phone link (text-link, без кнопки)

### Tertiary CTA copy — вариант D

```
Desktop: +7 914 758-20-78 · 17 часов покрытия в сутки
         (офисы в Москве и на Сахалине)

Mobile:  +7 914 758-20-78
         17 часов покрытия в сутки
```

**ВАЖНО:** НЕ писать «24/7». На сайте сейчас написано «поддержка 24/7»
— это ложь, на сайте РФ-юрлица это юр-риск. Пишем правду:
17 часов покрытия за счёт двух офисов (Сахалин 9-18 UTC+11 + Москва
9-18 UTC+3 = с 1:00 МСК до 18:00 МСК = 17 часов).

В Hero подзаголовке/description:
- Заменить «поддержка 24/7» на «поддержка 17 часов в сутки за счёт
  офисов в Москве и на Сахалине».
- В description: «...поддержка с 1:00 МСК до 18:00 МСК (пн–пт),
  17 часов покрытия в сутки за счёт офисов в Москве и на Сахалине».

### Stat-Strip — 3 цифры (не 4)

| Value | Label              |
|-------|--------------------|
| 200+  | внедрений          |
| 7     | дней до отчёта     |
| 17ч   | покрытия в сутки   |

Первую цифру про опыт убираем — eyebrow в Hero уже говорит
«С 2015 ГОДА», дублирование избыточно.

### CSS-фикс CTA-кнопки (WCAG-критичный)

Добавить `--accent-text: #1a1030` (тёмный текст на оранжевом).
Контраст **6.94:1** (вместо текущих **2.61:1** на белом — fail AA).

### CSS дополнения в `:root`

```css
:root {
  --accent-text:    #1a1030;
  --accent-hover:   #e66a0d;
  --accent-active:  #cc5e10;
  --surface-card:   rgba(255, 255, 255, 0.04);
  --surface-elev:   rgba(255, 255, 255, 0.06);
  --border-subtle:  rgba(255, 255, 255, 0.10);
  --border-strong:  rgba(255, 255, 255, 0.18);
  --focus-ring:     0 0 0 2px var(--bg), 0 0 0 4px var(--accent);
}
```

### Аналитика

- **Метрика snippet** — современный 2024-2026:
  - БЕЗ `ssr:true`, БЕЗ `defer:true`, БЕЗ `ecommerce:"dataLayer"`
  - URL: `https://mc.yandex.ru/metrika/tag.js` (без `?id=` query-param)
  - Init params: `clickmap`, `trackLinks`, `accurateTrackBounce`, `webvisor`
- **GA4** — БЕЗ `transport_type:'beacon'` (deprecated)
- Делегированный tracker через `addEventListener('click', ...)`
  на `document` с `data-event` атрибутами:
  - `data-event="hero_cta_audit_primary"`
  - `data-event="hero_cta_telegram_secondary"`
  - `data-event="hero_cta_phone_tertiary"`
  - `data-event="schema_cta_audit_inline"`
- **IntersectionObserver** one-shot для `scheme_view` цели,
  с guard `if ('IntersectionObserver' in window)`
- **Все аналитики обернуть в TODO** «cookie-consent gate перед продом»

### Roadmap (для `docs/integration-notes.md`)

1. `.systems` → карточки с метриками
2. `.faq` → структурировать в категории
3. Кейсы (новая секция)
4. Performance / LCP optimization
5. **152-ФЗ compliance (ОБЯЗАТЕЛЬНЫЙ юр-блок)** — 6 пунктов чек-листа
6. `.partners` — очистка логотипов на качественные SVG

### 152-ФЗ чек-лист (для секции «TODO перед продом» в integration-notes)

- [ ] Privacy-policy страница (`/privacy` или `/personal-data-policy`)
- [ ] Cookie/data-consent banner **до** срабатывания Метрики/GA4
- [ ] Отдельный checkbox согласия на формах (не «нажимая кнопку»)
- [ ] Указание оператора ПДн в политике (юрлицо, ИНН, ОГРН —
      ООО «Альфа-Касса» / ООО «Альфа-Трейд» из брендбука 2019)
- [ ] Email для запросов субъектов ПДн
- [ ] Регистрация в Роскомнадзоре как оператор ПДн

## Стратегия генерации (защита от timeout)

**ВАЖНО:** предыдущая сессия упала 3 раза на больших ответах.
В новой сессии — генерируй **по одному файлу за turn**, не больше.
После каждого файла — `git add` + `commit` + `push`, потом ждать
подтверждения user перед следующим файлом.

Порядок:

| Turn | Файл | Commit message | После |
|------|------|----------------|-------|
| 1 | `index.html` | `wip: hero index.html prototype` | push → wait |
| 2 | `assets/css/hero.css` | `wip: hero base styles` | push → wait |
| 3 | `assets/js/hero.js` | `wip: hero scripts` | push → wait |
| 4 | `docs/integration-notes.md` | `feat: hero MVP complete` | push → done |

## Артефакты в репо (на момент начала C)

- `docs/accessibility-baseline.md` (`194b29b`)
- `public/brand/logo-color.svg`, `logo-mono.svg` (`c6f7c31`)
- `6708_alfa.pdf` — бренд-гайд
- `logotip_alfa_grupp*.pdf` — логотипы
- EPS-файлы (7.7 MB) уже удалены в `c6f7c31`

## Egress-ограничения окружения

Прокси-allowlist блокирует прямой fetch:
- `gruppa-alfa.ru` → 403 `host_not_allowed`
- `yandex.ru/support/...` → 403 `host_not_allowed`
- `github.com` доступен только через Claude GitHub App (push/PR);
  raw.githubusercontent.com может быть недоступен

Поэтому live-сайт читать невозможно — все данные о существующем
сайте получены пользователем через DevTools и переданы в чате.

## Безопасность

API-ключ 21st.dev (Magic MCP) регенерирован 27 апреля 2026.
Все предыдущие версии ключа в transcript предыдущих сессий
**недействительны**. Ключ хранится в `/root/.claude.json`,
никогда не выводить в чат целиком.

## Ключевые цитаты для context-recovery

Из брифа Gemini (раздел 1):
> Компания занимается комплексной IT-автоматизацией бизнеса и
> подключением к государственным системам (ЕГАИС, Честный знак),
> включая настройку касс, интеграцию с 1С и техподдержку.

Существующий H1 (оставляем как есть):
> ПОДКЛЮЧАЕМ БИЗНЕС К **ОБЯЗАТЕЛЬНЫМ ГОССИСТЕМАМ РФ**

Существующий sub-keywords (оставляем):
> ЕГАИС, ЧЕСТНЫЙ ЗНАК, МЕРКУРИЙ, ЦИФРОВОЙ РУБЛЬ

Узлы Schema-First диаграммы (финал):
- Вход: `1С:ERP` (производство), `1С:Розница` (ритейл), `1С:УТ` (опт)
- Стек: `1С Платформа`, `PostgreSQL для 1С`, `Linux серверы`
- Интеграции: `ЕГАИС`, `Меркурий`, `Честный знак`, `ФФД 1.2`
