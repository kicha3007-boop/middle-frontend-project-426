import { Link } from "react-router";

import type { Product } from "../api/types";
import { Availability } from "../components/Availability";
import { ProductImage } from "../components/ProductImage";
import { formatPrice } from "../lib/format";

export const ProductCard = ({ product }: { product: Product }) => (
  <article
    className={`product-card ${product.available ? "" : "product-card-unavailable"}`}
    data-testid="catalog-item"
  >
    <ProductImage src={product.imageUrl} alt={product.name} className="product-card-image" />
    <div className="product-card-body">
      <h3 className="product-card-title">
        <Link to={`/products/${product.id}`} data-testid="catalog-item-name">
          {product.name}
        </Link>
      </h3>
      <p className="product-card-description">{product.description}</p>
      <div className="product-card-footer">
        <span className="price" data-testid="catalog-item-price">
          {formatPrice(product.price)}
        </span>
        <Availability available={product.available} testId="catalog-item-availability" />
      </div>
    </div>
  </article>
);
