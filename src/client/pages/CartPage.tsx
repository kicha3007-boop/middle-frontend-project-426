import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useCart } from "../cart/CartContext";
import { MAX_QUANTITY } from "../cart/cartStorage";
import { cartTotal, useCartProducts, type CartLine } from "../cart/useCartProducts";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { ProductImage } from "../components/ProductImage";
import { formatPrice } from "../lib/format";

const QuantityInput = ({ line }: { line: CartLine }) => {
  const { setQuantity } = useCart();
  // Черновик позволяет стереть число и набрать новое, не превращая пустое поле в единицу.
  const [draft, setDraft] = useState(String(line.quantity));
  const [prevQuantity, setPrevQuantity] = useState(line.quantity);
  if (prevQuantity !== line.quantity) {
    setPrevQuantity(line.quantity);
    setDraft(String(line.quantity));
  }

  return (
    <input
      type="number"
      className="qty-input"
      data-testid="cart-item-qty"
      aria-label="Количество"
      min={1}
      max={MAX_QUANTITY}
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value);
        const value = Number(event.target.value);
        if (Number.isInteger(value) && value >= 1) {
          setQuantity(line.productId, value);
        }
      }}
      onBlur={() => setDraft(String(line.quantity))}
    />
  );
};

const CartRow = ({ line }: { line: CartLine }) => {
  const { remove } = useCart();
  const { product } = line;

  return (
    <li className="cart-item" data-testid="cart-item">
      <ProductImage
        src={product?.imageUrl ?? null}
        alt={product?.name ?? "Товар"}
        className="cart-item-image"
      />
      <div className="cart-item-info">
        {product ? (
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        ) : (
          <span>Товар №{line.productId}</span>
        )}
        {product === null ? (
          <p className="warning">Этого товара больше нет в каталоге — удалите его из корзины.</p>
        ) : null}
        {product && !product.available ? (
          <p className="warning">Товара сейчас нет в наличии — оформить его не получится.</p>
        ) : null}
        {product ? <span className="muted">{formatPrice(product.price)} за шт.</span> : null}
      </div>
      <div className="cart-item-controls">
        <QuantityInput line={line} />
        <span className="price">
          {product?.available ? formatPrice(product.price * line.quantity) : "—"}
        </span>
        <button
          type="button"
          className="button button-secondary"
          data-testid="cart-item-remove"
          onClick={() => remove(line.productId)}
        >
          Удалить
        </button>
      </div>
    </li>
  );
};

export const CartPage = () => {
  const { items } = useCart();
  const { state, reload } = useCartProducts(items);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="cart">
        <h1 className="page-title">Корзина</h1>
        <div className="empty-state" data-testid="cart-empty">
          <p>Корзина пуста.</p>
          <Link to="/catalog">Перейти в каталог</Link>
        </div>
        <button type="button" className="button" data-testid="cart-checkout" disabled>
          Оформить заказ
        </button>
      </div>
    );
  }

  if (state.status === "loading") {
    return <Loader label="Загружаем корзину…" />;
  }
  if (state.status === "error") {
    return <ErrorMessage message={state.message} onRetry={reload} />;
  }

  const lines: CartLine[] = items.map((item) => ({
    ...item,
    product: state.data.get(item.productId) ?? null,
  }));

  return (
    <div className="cart">
      <h1 className="page-title">Корзина</h1>
      <ul className="cart-list">
        {lines.map((line) => (
          <CartRow key={line.productId} line={line} />
        ))}
      </ul>
      <div className="cart-summary">
        <p>
          Итого: <strong data-testid="cart-total">{formatPrice(cartTotal(lines))}</strong>
        </p>
        <p className="muted">Окончательную сумму посчитаем при оформлении по текущим ценам.</p>
        <button
          type="button"
          className="button"
          data-testid="cart-checkout"
          onClick={() => navigate("/checkout")}
        >
          Оформить заказ
        </button>
      </div>
    </div>
  );
};
