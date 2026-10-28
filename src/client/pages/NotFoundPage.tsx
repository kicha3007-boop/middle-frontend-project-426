import { Link } from "react-router";

export const NotFoundPage = () => (
  <div className="empty-state">
    <h1 className="page-title">Страница не найдена</h1>
    <p>
      Такой страницы нет. Начните с <Link to="/">главной</Link> или загляните в{" "}
      <Link to="/catalog">каталог</Link>.
    </p>
  </div>
);
