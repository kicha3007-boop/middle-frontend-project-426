import { useState } from "react";
import { Link, useParams } from "react-router";

import { api, ApiError } from "../api/client";
import { useCart } from "../cart/CartContext";
import { Availability } from "../components/Availability";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { ProductImage } from "../components/ProductImage";
import { formatPrice } from "../lib/format";
import { useRemote } from "../lib/useRemote";
import { NotFoundPage } from "./NotFoundPage";

export const ProductPage = () => {
  const id = Number(useParams().id);
  const valid = Number.isInteger(id) && id > 0;
  const { state, reload } = useRemote(`product:${id}`, (signal) =>
    valid
      ? api.product(id, signal)
      : Promise.reject(new ApiError(404, { code: "NOT_FOUND", message: "Товар не найден" })),
  );
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);

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

  const product = state.data;
  const inCart = items.find((item) => item.productId === product.id)?.quantity ?? 0;

  return (
    <article className="product-page">
      <ProductImage src={product.imageUrl} alt={product.name} className="product-page-image" />
      <div className="product-page-info">
        <p className="muted">
          <Link to={`/catalog?category=${product.category.slug}`}>{product.category.name}</Link>
        </p>
        <h1 data-testid="product-name">{product.name}</h1>
        <p className="price price-large" data-testid="product-price">
          {formatPrice(product.price)}
        </p>
        <Availability available={product.available} />
        <p data-testid="product-description">{product.description}</p>

        {/* Недоступный товар в корзину не добавляется: кнопка заблокирована. */}
        <button
          type="button"
          className="button"
          data-testid="product-add-to-cart"
          disabled={!product.available}
          onClick={() => {
            add(product.id);
            setAdded(true);
          }}
        >
          {product.available ? "В корзину" : "Нет в наличии"}
        </button>
        {added || inCart > 0 ? (
          <p className="muted" aria-live="polite">
            В корзине: {inCart} шт. <Link to="/cart">Перейти в корзину</Link>
          </p>
        ) : null}
      </div>
    </article>
  );
};
