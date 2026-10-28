export const Loader = ({ label = "Загрузка…" }: { label?: string }) => (
  <p className="loader" aria-live="polite">
    {label}
  </p>
);
