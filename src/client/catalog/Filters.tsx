import { useEffect, useRef, useState } from "react";

import type { Category } from "../api/types";
import type { CatalogFilters } from "./catalogParams";

// Задержка ввода: запрос уходит, когда пользователь 300 мс не нажимал клавиш.
export const INPUT_DELAY_MS = 300;

type Props = {
  filters: CatalogFilters;
  categories: Category[];
  onChange: (filters: CatalogFilters) => void;
  onReset: () => void;
};

type TextDraft = Pick<CatalogFilters, "q" | "min" | "max">;

const sameText = (left: TextDraft, right: TextDraft): boolean =>
  left.q === right.q && left.min === right.min && left.max === right.max;

const onlyDigits = (value: string): string => value.replace(/\D/g, "").slice(0, 9);

// Контролы отзываются сразу: у каждого своё состояние, а адрес — источник правды для запроса.
// Текстовые поля применяются с задержкой, список и чекбокс — немедленно.
export const Filters = ({ filters, categories, onChange, onReset }: Props) => {
  const [text, setText] = useState<TextDraft>({ q: filters.q, min: filters.min, max: filters.max });
  const [category, setCategory] = useState(filters.category);
  const [inStock, setInStock] = useState(filters.inStock);

  // Значения, которые мы сами отправили в адрес: их возвращение из адреса не должно
  // перетирать то, что пользователь успел напечатать.
  const applied = useRef<TextDraft>(text);

  // Адрес поменялся извне («назад», сброс, переход по ссылке) — контролы догоняют его.
  useEffect(() => {
    const fromUrl = { q: filters.q, min: filters.min, max: filters.max };
    if (!sameText(fromUrl, applied.current)) {
      applied.current = fromUrl;
      setText(fromUrl);
    }
  }, [filters.q, filters.min, filters.max]);

  useEffect(() => setCategory(filters.category), [filters.category]);
  useEffect(() => setInStock(filters.inStock), [filters.inStock]);

  const latest = useRef({ filters, onChange });
  latest.current = { filters, onChange };

  useEffect(() => {
    if (sameText(text, applied.current)) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      applied.current = text;
      latest.current.onChange({ ...latest.current.filters, ...text });
    }, INPUT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [text]);

  const changeCategory = (value: string) => {
    setCategory(value);
    applied.current = text;
    onChange({ ...filters, ...text, category: value });
  };

  const changeInStock = (value: boolean) => {
    setInStock(value);
    applied.current = text;
    onChange({ ...filters, ...text, inStock: value });
  };

  return (
    <form
      className="filters"
      data-testid="catalog-filters"
      onSubmit={(event) => event.preventDefault()}
    >
      <h2 className="filters-title">Фильтры</h2>

      <label className="field">
        <span className="field-label">Поиск по названию</span>
        <input
          type="search"
          data-testid="filter-search"
          value={text.q}
          maxLength={100}
          placeholder="Например, RTX"
          onChange={(event) => setText((current) => ({ ...current, q: event.target.value }))}
        />
      </label>

      <label className="field">
        <span className="field-label">Категория</span>
        <select
          data-testid="filter-category"
          value={category}
          onChange={(event) => changeCategory(event.target.value)}
        >
          <option value="">Все категории</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="field price-range">
        <legend className="field-label">Цена, ₽</legend>
        <input
          type="text"
          inputMode="numeric"
          aria-label="Цена от"
          placeholder="от"
          data-testid="filter-price-min"
          value={text.min}
          onChange={(event) =>
            setText((current) => ({ ...current, min: onlyDigits(event.target.value) }))
          }
        />
        <input
          type="text"
          inputMode="numeric"
          aria-label="Цена до"
          placeholder="до"
          data-testid="filter-price-max"
          value={text.max}
          onChange={(event) =>
            setText((current) => ({ ...current, max: onlyDigits(event.target.value) }))
          }
        />
      </fieldset>

      <label className="checkbox">
        <input
          type="checkbox"
          data-testid="filter-available"
          checked={inStock}
          onChange={(event) => changeInStock(event.target.checked)}
        />
        Только в наличии
      </label>

      <button
        type="button"
        className="button button-secondary"
        data-testid="filter-reset"
        onClick={onReset}
      >
        Сбросить фильтры
      </button>
    </form>
  );
};
