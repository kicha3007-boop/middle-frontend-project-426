import type { Order } from "../api/types";
import { formatDate, formatPrice } from "../lib/format";

const METHOD_LABELS: Record<Order["method"], string> = {
  delivery: "Доставка",
  pickup: "Самовывоз",
};

const STATUS_LABELS: Record<Order["status"], string> = {
  paid: "Оплачен",
};

// Состав заказа — снимок на момент покупки: названия и цены из позиций заказа, а не из каталога.
export const OrderDetails = ({ order }: { order: Order }) => (
  <div className="order-details">
    <dl className="order-meta">
      <div>
        <dt>Статус</dt>
        <dd>
          <span
            className="badge badge-success"
            data-testid="order-status"
            data-status={order.status}
          >
            {STATUS_LABELS[order.status]}
          </span>
        </dd>
      </div>
      <div>
        <dt>Дата</dt>
        <dd>{formatDate(order.createdAt)}</dd>
      </div>
      <div>
        <dt>Получение</dt>
        <dd>
          {METHOD_LABELS[order.method]}
          {order.address ? `: ${order.address}` : ""}
        </dd>
      </div>
      <div>
        <dt>Получатель</dt>
        <dd>
          {order.recipientName}, {order.phone}
        </dd>
      </div>
    </dl>

    <ul className="order-lines">
      {order.lines.map((line) => (
        <li key={line.productId} className="order-line" data-testid="account-order-line">
          <span className="order-line-name">{line.name}</span>
          <span className="order-line-numbers">
            <span data-testid="account-order-line-qty">{line.quantity} шт.</span>
            {" × "}
            <span data-testid="account-order-line-price">{formatPrice(line.price)}</span>
            {" = "}
            <strong>{formatPrice(line.subtotal)}</strong>
          </span>
        </li>
      ))}
    </ul>

    <p className="order-total">
      Итого: <strong data-testid="order-total">{formatPrice(order.total)}</strong>
    </p>
  </div>
);
