import { Link, NavLink, Outlet, useNavigate } from "react-router";

import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";

const Header = () => {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          ЖелезоМаркет
        </Link>
        <nav className="nav" aria-label="Основная навигация">
          <NavLink to="/catalog" data-testid="nav-catalog">
            Каталог
          </NavLink>
          <NavLink to="/cart" data-testid="nav-cart">
            Корзина
            {count > 0 ? (
              <span className="nav-count" aria-label={`товаров: ${count}`}>
                {count}
              </span>
            ) : null}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/account" data-testid="nav-account">
                Кабинет
              </NavLink>
              <button
                type="button"
                className="nav-button"
                data-testid="nav-signout"
                onClick={() => void handleSignOut()}
              >
                Выйти
              </button>
            </>
          ) : null}
          {user === null ? (
            <>
              <NavLink to="/signin" data-testid="nav-signin">
                Войти
              </NavLink>
              <NavLink to="/signup" data-testid="nav-signup">
                Регистрация
              </NavLink>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
};

export const Layout = () => (
  <div className="page">
    <Header />
    <main className="container main">
      <Outlet />
    </main>
    <footer className="footer">
      <div className="container">ЖелезоМаркет — учебный интернет-магазин комплектующих для ПК</div>
    </footer>
  </div>
);
