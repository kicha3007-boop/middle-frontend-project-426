import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";

import { api } from "../api/client";
import {
  emptyFilters,
  parseCatalogState,
  toProductQuery,
  toSearchParams,
  type CatalogFilters,
} from "../catalog/catalogParams";
import { Filters } from "../catalog/Filters";
import { Pagination } from "../catalog/Pagination";
import { ProductCard } from "../catalog/ProductCard";
import { useProductPage } from "../catalog/useProductPage";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { useRemote } from "../lib/useRemote";

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.toString();
  const state = useMemo(() => parseCatalogState(new URLSearchParams(search)), [search]);
  const query = useMemo(() => toProductQuery(state), [state]);

  const products = useProductPage(query);
  const categories = useRemote("categories", (signal) => api.categories(signal));

  // Смена фильтра применяется ко всей выдаче, поэтому номер страницы сбрасывается на первую.
  // Каждое изменение — новая запись в истории: «назад» возвращает прежнюю выдачу.
  const changeFilters = (filters: CatalogFilters) =>
    setSearchParams(toSearchParams({ ...filters, page: 1 }));

  const resetFilters = () => setSearchParams(toSearchParams({ ...emptyFilters, page: 1 }));

  const changePage = (page: number) => {
    setSearchParams(toSearchParams({ ...state, page }));
    window.scrollTo({ top: 0 });
  };

  // Номер страницы из адреса больше, чем страниц в выдаче, — переходим на последнюю.
  const totalPages = products.data?.totalPages ?? 0;
  useEffect(() => {
    if (products.fresh && totalPages > 0 && state.page > totalPages) {
      setSearchParams(toSearchParams({ ...state, page: totalPages }), { replace: true });
    }
  }, [products.fresh, totalPages, state, setSearchParams]);

  const renderResults = () => {
    if (products.error) {
      return <ErrorMessage message={products.error} onRetry={products.reload} />;
    }
    if (!products.data) {
      return <Loader label="Загружаем товары…" />;
    }
    if (products.data.items.length === 0) {
      return (
        <div className="empty-state" data-testid="catalog-empty">
          <p>Под выбранные фильтры ничего не подошло.</p>
          <button type="button" className="button button-secondary" onClick={resetFilters}>
            Сбросить фильтры
          </button>
        </div>
      );
    }
    return (
      <>
        <p className="catalog-total">Найдено товаров: {products.data.total}</p>
        <div className="product-grid">
          {products.data.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Pagination
          page={products.data.page}
          totalPages={products.data.totalPages}
          onChange={changePage}
        />
      </>
    );
  };

  return (
    <div className="catalog">
      <h1 className="page-title">Каталог</h1>
      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <Filters
            filters={state}
            categories={categories.state.status === "success" ? categories.state.data : []}
            onChange={changeFilters}
            onReset={resetFilters}
          />
          {categories.state.status === "error" ? (
            <ErrorMessage message={categories.state.message} onRetry={categories.reload} />
          ) : null}
        </aside>
        <section
          className={`catalog-results ${products.loading ? "is-loading" : ""}`}
          data-testid="catalog-list"
          aria-busy={products.loading}
          aria-label="Товары"
        >
          {renderResults()}
        </section>
      </div>
    </div>
  );
};
