type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

// «Назад» на первой странице и «вперёд» на последней заблокированы:
// пагинация не уводит в несуществующую страницу.
export const Pagination = ({ page, totalPages, onChange }: Props) => (
  <nav className="pagination" data-testid="catalog-pagination" aria-label="Страницы каталога">
    <button
      type="button"
      className="button button-secondary"
      data-testid="catalog-page-prev"
      disabled={page <= 1}
      onClick={() => onChange(page - 1)}
    >
      ← Назад
    </button>
    <span className="pagination-info">
      Страница {page} из {Math.max(totalPages, 1)}
    </span>
    <button
      type="button"
      className="button button-secondary"
      data-testid="catalog-page-next"
      disabled={page >= totalPages}
      onClick={() => onChange(page + 1)}
    >
      Вперёд →
    </button>
  </nav>
);
