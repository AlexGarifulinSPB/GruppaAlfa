# Accessibility Baseline — gruppa-alfa.ru

**Snapshot:** 2026-04-27
**Scope:** Hero и видимые above-the-fold элементы. Палитра извлечена из `:root` пользователем через DevTools (живой источник сайта в репозитории отсутствует, прямой fetch заблокирован egress-allowlist).
**Стандарт:** WCAG 2.1 AA — целевой; AAA — желательный там, где достижим без брендовых компромиссов.

---

## 1. Палитра в использовании

Извлечена из CSS-переменных `:root` сайта.

| Токен | HEX | Роль |
|-------|-----|------|
| `--bg` | `#1a1030` | Page background (тёмный фиолетовый) |
| `--ink` | `#ffffff` | Основной текст на тёмном |
| `--purple-deep` | `#3d2963` | Секционные разделители, более глубокий фон |
| `--purple-brand` | `#6b4a9e` | Brand-поверхности, карточки |
| `--purple-mid` | `#7a5bb0` | Вторичные поверхности |
| `--purple-light` | `#a890d4` | Подписи, captions, лейблы |
| `--purple-pale` | `#e8ddf5` | Светлый текст, hint backgrounds |
| `--accent` | `#ff7a1a` | CTA / highlight (off-brand — см. примечания) |

> **Brand-guide note:** v.2019 фиксирует **один** фирменный цвет — `#685493` (purple). Оранжевый `#ff7a1a`, текущая палитра `--purple-*` и `--bg #1a1030` — расширение, не зафиксированное в брендбуке. Требуется официальное обновление brand-guide v.2.

---

## 2. Контрастная матрица

Расчёт по WCAG 2.1: sRGB → relative luminance, contrast = (L_max + 0.05) / (L_min + 0.05).

| Pair | Ratio | AA-normal (≥4.5) | AA-large (≥3.0) | AAA (≥7.0) | Verdict |
|------|------:|:---:|:---:|:---:|---|
| `#ffffff` on `#1a1030` | 18.09:1 | ✓ | ✓ | ✓ | AAA, body text безопасно |
| `#ffffff` on `#3d2963` | 12.38:1 | ✓ | ✓ | ✓ | AAA |
| `#ffffff` on `#6b4a9e` | 6.78:1 | ✓ | ✓ | ✗ | OK для AA |
| `#ff7a1a` on `#1a1030` | 6.94:1 | ✓ | ✓ | ✗ | OK для AA-normal (оранжевый текст) |
| `#ff7a1a` on `#3d2963` | 4.75:1 | ✓ | ✓ | ✗ | На грани AA-normal |
| **`#ffffff` on `#ff7a1a`** | **2.61:1** | **✗** | **✗** | ✗ | **❗ FAIL — белый текст на оранжевой кнопке** |
| `#1a1030` on `#ff7a1a` | 6.95:1 | ✓ | ✓ | ✗ | **Fix-1: тёмный текст на оранжевой кнопке** |
| `#ffffff` on `#b34d00` | 5.28:1 | ✓ | ✓ | ✗ | **Fix-2 (alt): белый текст на затемнённой кнопке** |
| `#a890d4` on `#1a1030` | 6.55:1 | ✓ | ✓ | ✗ | OK |
| `#e8ddf5` on `#1a1030` | 13.86:1 | ✓ | ✓ | ✓ | AAA |
| `#7a5bb0` on `#1a1030` | 3.40:1 | ✗ | ✓ | ✗ | Только large (≥18pt / ≥14pt-bold) |
| `#6b4a9e` on `#1a1030` | 2.67:1 | ✗ | ✗ | ✗ | Только как фон, не как текст |

---

## 3. Критические находки

### 3.1. ❗ Оранжевая CTA-кнопка (assumed, требует подтверждения)

White text on `--accent` button → **2.61:1**, нарушение AA-normal и AA-large.

**Статус:** assumption based on brief. Источник сайта в репо отсутствует — точный цвет текста кнопки не подтверждён.
**Recommended fix:** Option 1 — тёмный текст `#1a1030` на `#ff7a1a` (= 6.94:1, без расширения палитры).

### 3.2. `--purple-mid` и `--purple-brand` непригодны как текст на `--bg`

Используются только как fills/backgrounds. Если где-то применены к `<span>`/`<p>` — заменить на `--purple-light` (6.55:1) или `--purple-pale` (13.86:1).

### 3.3. Off-brand `--accent`

Не блокирует accessibility, но требует фиксации в brand-guide v.2 как официальный CTA-акцент.

---

## 4. Required fixes (priority)

| # | Fix | Селектор/scope | Стоимость |
|---|-----|----------------|-----------|
| 1 | Тёмный текст на оранжевых CTA | `.btn-primary`, `.cta-orange`, любой `background: var(--accent)` элемент | 1 правило CSS (`color: var(--accent-text)`) |
| 2 | Заменить `--purple-mid` / `--purple-brand` в текстовых ролях | grep по проекту, селективные правки | < 30 мин |
| 3 | Видимый focus ring | `:focus-visible` глобально | 1 правило (~3 строки) |
| 4 | `prefers-reduced-motion` для всех transitions/animations | глобальный media-query | 1 блок CSS |

---

## 5. Method to extend this baseline

При добавлении новых цветов в палитру:

1. Внести в таблицу п.1.
2. Прогнать через скрипт-проверщик (хранить как `scripts/contrast-check.py`, см. Appendix).
3. Любая пара ниже 4.5:1, используемая как text-on-bg, должна быть помечена ❗ и иметь зафиксированный fix.
4. AAA ≥ 7:1 — желательно, но не блокирует мерж.

---

## 6. Methodology — формула контраста

```
sRGB → linear:
  c_lin = c / 12.92                          if c ≤ 0.03928
  c_lin = ((c + 0.055) / 1.055) ^ 2.4        иначе

L = 0.2126·R_lin + 0.7152·G_lin + 0.0722·B_lin
contrast = (L_max + 0.05) / (L_min + 0.05)
```

Reference: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio

---

## Appendix — quick contrast-check snippet

```python
def lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def luminance(rgb):
    r, g, b = (lin(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def contrast(a, b):
    L1, L2 = luminance(hex_to_rgb(a)), luminance(hex_to_rgb(b))
    if L1 < L2:
        L1, L2 = L2, L1
    return (L1 + 0.05) / (L2 + 0.05)

# usage: contrast('#ffffff', '#1a1030') → 18.09
```
