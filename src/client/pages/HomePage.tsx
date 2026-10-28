import { Link } from "react-router";

import { api } from "../api/client";
import { ErrorMessage } from "../components/ErrorMessage";
import { Loader } from "../components/Loader";
import { ProductImage } from "../components/ProductImage";
import { formatPrice } from "../lib/format";
import { useRemote } from "../lib/useRemote";

// Главная: описание магазина и промо-блоки из базы. Тексты блоков приходят с бэкенда.
export const HomePage = () => {
  const { state, reload } = useRemote("promos", (signal) => api.promos(signal));

  const renderPromos = () => {
    if (state.status === "loading") {
      return <Loader />;
    }
    if (state.status === "error") {
      return <ErrorMessage message={state.message} onRetry={reload} />;
    }
    if (state.data.length === 0) {
      return <p className="muted">Сейчас акций нет — загляните в каталог.</p>;
    }
    return (
      <div className="promo-grid">
        {state.data.map((promo) => (
          <Link
            key={promo.id}
            to={`/products/${promo.product.id}`}
            className="promo-card"
            data-testid="home-promo-item"
          >
            <ProductImage src={promo.product.imageUrl} alt={promo.product.name} />
            <div className="promo-card-body">
              <h3 className="promo-card-title">{promo.title}</h3>
              <p>{promo.text}</p>
              <p className="promo-card-product">
                {promo.product.name} — <strong>{formatPrice(promo.product.price)}</strong>
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="home">
      <section className="hero">
        <h1>Комплектующие для ПК с доставкой по городу</h1>
        <p>
          Видеокарты, процессоры, материнские платы, память и всё остальное для сборки компьютера.
          Подберите детали в каталоге, а мы привезём их или подготовим к самовывозу.
        </p>
        <Link to="/catalog" className="button">
          Перейти в каталог
        </Link>
      </section>

      <section className="promos" data-testid="home-promo" aria-labelledby="promos-title">
        <h2 id="promos-title">Сейчас советуем</h2>
        {renderPromos()}
      </section>
    </div>
  );
};
