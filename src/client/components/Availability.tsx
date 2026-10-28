type Props = {
  available: boolean;
  testId?: string;
};

// Доступность дублируется атрибутом data-available: по нему её читают тесты, а не по тексту.
export const Availability = ({ available, testId }: Props) => (
  <span
    className={`badge ${available ? "badge-success" : "badge-muted"}`}
    data-testid={testId}
    data-available={String(available)}
  >
    {available ? "В наличии" : "Нет в наличии"}
  </span>
);
