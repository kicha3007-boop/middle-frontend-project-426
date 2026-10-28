import { Link, useLocation, useParams } from "react-router";

import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { useRemote } from "../lib/useRemote";
import { OrderDetails } from "../orders/OrderDetails";
import { NotFoundPage } from "./NotFoundPage";

// Страница заказа. Сразу после оформления она же — страница успеха.
export const OrderPage = () => {
  const id = Number(useParams().id);
  const location = useLocation();
  const justPlaced = (location.state as { placed?: boolean } | null)?.placed === true;
  const { state, reload } = useRemote(`order:${id}`, (signal) => api.order(id, signal));

  if (state.status === "loading") {
    return <Loader />;
  }
  if (state.status === "error") {
    return state.notFound ? (
      <NotFoundPage />
    ) : (
      <ErrorMessage message={state.message} onRetry={reload} />
    );
  }

  return (
    <div className="order-page" data-testid={justPlaced ? "order-success" : undefined}>
      <h1 className="page-title">
        {justPlaced ? `Заказ №${state.data.id} оформлен` : `Заказ №${state.data.id}`}
      </h1>
      {justPlaced ? <p>Спасибо за покупку! Заказ оплачен и уже собирается.</p> : null}
      <OrderDetails order={state.data} />
      <p>
        <Link to="/account">Все заказы</Link> · <Link to="/catalog">Вернуться в каталог</Link>
      </p>
    </div>
  );
};
