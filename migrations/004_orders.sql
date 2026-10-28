CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id),
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid')),
  method TEXT NOT NULL CHECK (method IN ('delivery', 'pickup')),
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  total INTEGER NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (method = 'pickup' OR address IS NOT NULL)
);

CREATE INDEX orders_user_id_idx ON orders (user_id);

-- Позиция — снимок товара на момент покупки: название и цена копируются,
-- поэтому заказ не меняется вслед за каталогом. product_id без внешнего ключа:
-- товар могут удалить из каталога, а история заказа должна остаться.
CREATE TABLE order_lines (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX order_lines_order_id_idx ON order_lines (order_id);
