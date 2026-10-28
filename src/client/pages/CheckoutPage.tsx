import { useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";

import { ApiError, api, errorMessage } from "../api/client";
import type { DeliveryMethod, OrderProblem } from "../api/types";
import { useCart } from "../cart/CartContext";

type Form = {
  method: DeliveryMethod;
  recipientName: string;
  phone: string;
  address: string;
};

type Errors = Partial<Record<keyof Form, string>>;

const PHONE = /^\+?[\d\s()-]{5,30}$/;

const validate = (form: Form): Errors => {
  const errors: Errors = {};
  if (!form.recipientName.trim()) {
    errors.recipientName = "Укажите имя получателя";
  }
  if (!PHONE.test(form.phone.trim())) {
    errors.phone = "Укажите телефон, например +7 999 000-11-22";
  }
  if (form.method === "delivery" && !form.address.trim()) {
    errors.address = "Для доставки нужен адрес";
  }
  return errors;
};

type SubmitError = { message: string; problems: OrderProblem[] };

const problemText = (problem: OrderProblem): string => {
  const name = problem.name ?? `Товар №${problem.productId}`;
  return problem.reason === "unavailable" ? `${name} — нет в наличии` : `${name} — нет в каталоге`;
};

// Оформление: только для авторизованных (RequireAuth в роутере) и только с непустой корзиной.
// На сервер уходят состав корзины и данные получения — без цен и итога.
export const CheckoutPage = () => {
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({
    method: "delivery",
    recipientName: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const placed = useRef(false);

  if (items.length === 0 && !placed.current) {
    return <Navigate to="/cart" replace />;
  }

  const update = (field: keyof Form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await api.createOrder({
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        receipt: {
          method: form.method,
          recipientName: form.recipientName.trim(),
          phone: form.phone.trim(),
          ...(form.method === "delivery" ? { address: form.address.trim() } : {}),
        },
      });
      placed.current = true;
      clear();
      navigate(`/orders/${order.id}`, { replace: true, state: { placed: true } });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate(`/signin?next=${encodeURIComponent("/checkout")}`);
        return;
      }
      setSubmitError({
        message: errorMessage(error),
        problems: error instanceof ApiError ? error.problems : [],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout">
      <h1 className="page-title">Оформление заказа</h1>
      <form
        className="checkout-form"
        data-testid="checkout-form"
        noValidate
        onSubmit={(event) => void handleSubmit(event)}
      >
        <label className="field">
          <span className="field-label">Способ получения</span>
          <select
            data-testid="checkout-method"
            value={form.method}
            onChange={(event) => update("method", event.target.value)}
          >
            <option value="delivery">Доставка по городу</option>
            <option value="pickup">Самовывоз из магазина</option>
          </select>
        </label>

        <label className="field">
          <span className="field-label">Имя получателя</span>
          <input
            data-testid="checkout-name"
            value={form.recipientName}
            maxLength={100}
            autoComplete="name"
            aria-invalid={Boolean(errors.recipientName)}
            onChange={(event) => update("recipientName", event.target.value)}
          />
          {errors.recipientName ? (
            <span className="field-error">{errors.recipientName}</span>
          ) : null}
        </label>

        <label className="field">
          <span className="field-label">Телефон</span>
          <input
            type="tel"
            data-testid="checkout-phone"
            value={form.phone}
            maxLength={30}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            onChange={(event) => update("phone", event.target.value)}
          />
          {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
        </label>

        {form.method === "delivery" ? (
          <label className="field">
            <span className="field-label">Адрес доставки</span>
            <input
              data-testid="checkout-address"
              value={form.address}
              maxLength={300}
              autoComplete="street-address"
              placeholder="Улица, дом, квартира"
              aria-invalid={Boolean(errors.address)}
              onChange={(event) => update("address", event.target.value)}
            />
            {errors.address ? <span className="field-error">{errors.address}</span> : null}
          </label>
        ) : (
          <p className="muted">Заберите заказ в магазине: ул. Пушкина, 10, ежедневно с 10 до 21.</p>
        )}

        {submitError ? (
          <div className="alert alert-error" role="alert" data-testid="order-error">
            <p>{submitError.message}</p>
            {submitError.problems.length > 0 ? (
              <ul>
                {submitError.problems.map((problem) => (
                  <li key={problem.productId}>{problemText(problem)}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          className="button"
          data-testid="checkout-submit"
          disabled={submitting}
        >
          {submitting ? "Оформляем…" : "Оформить заказ"}
        </button>
      </form>
    </div>
  );
};
