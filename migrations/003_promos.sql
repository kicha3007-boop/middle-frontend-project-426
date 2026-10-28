-- Один товар — не больше одного промо-блока.
CREATE TABLE promos (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  product_id INTEGER NOT NULL UNIQUE REFERENCES products (id),
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);
