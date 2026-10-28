import { Link } from "react-router";

import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { useRemote } from "../lib/useRemote";
import { OrderDetails } from "../orders/OrderDetails";

// Личный кабинет: только свои заказы — сервер отдаёт их по сессии, а не по идентификатору.
export const AccountPage = () => {
  const { user } = useAuth();
  const { state, reload } = useRemote(`orders:${user?.id ?? ""}`, (signal) => api.orders(signal));

  const renderOrders = () => {
    if (state.status === "loading") {
      return <Loader />;
    }
    if (state.status === "error") {
      return <ErrorMessage message={state.message} onRetry={reload} />;
    }
    if (state.data.length === 0) {
      return (
        <div className="empty-state" data-testid="account-orders-empty">
          <p>Заказов пока нет.</p>
          <Link to="/catalog">Выбрать товары в каталоге</Link>
        </div>
      );
    }
    return (
      <ul className="account-orders" data-testid="account-orders">
        {state.data.map((order) => (
          <li key={order.id} className="account-order" data-testid="account-order-item">
            <h3>
              <Link to={`/orders/${order.id}`}>Заказ №{order.id}</Link>
            </h3>
            <OrderDetails order={order} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="account">
      <h1 className="page-title">Личный кабинет</h1>
      <p className="muted">{user?.email}</p>
      <h2>Мои заказы</h2>
      {renderOrders()}
    </div>
  );
};
