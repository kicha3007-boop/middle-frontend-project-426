import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { loadCart, MAX_QUANTITY, saveCart, type CartItem } from "./cartStorage";

type CartState = {
  items: CartItem[];
  count: number;
  add: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartState | null>(null);

const clamp = (quantity: number): number => Math.min(Math.max(quantity, 1), MAX_QUANTITY);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const value = useMemo<CartState>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      add: (productId) =>
        setItems((current) =>
          current.some((item) => item.productId === productId)
            ? current.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: clamp(item.quantity + 1) }
                  : item,
              )
            : [...current, { productId, quantity: 1 }],
        ),
      setQuantity: (productId, quantity) =>
        setItems((current) =>
          current.map((item) =>
            item.productId === productId ? { ...item, quantity: clamp(quantity) } : item,
          ),
        ),
      remove: (productId) =>
        setItems((current) => current.filter((item) => item.productId !== productId)),
      clear: () => setItems([]),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartState => {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart вызван вне CartProvider");
  }
  return value;
};
