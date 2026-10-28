const priceFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

// Цены — целые рубли без копеек.
export const formatPrice = (amount: number): string => `${priceFormat.format(amount)} ₽`;

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDate = (iso: string): string => dateFormat.format(new Date(iso));
