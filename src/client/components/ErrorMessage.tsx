type Props = {
  message: string;
  onRetry?: () => void;
};

export const ErrorMessage = ({ message, onRetry }: Props) => (
  <div className="alert alert-error" role="alert">
    <p>{message}</p>
    {onRetry ? (
      <button type="button" className="button button-secondary" onClick={onRetry}>
        Повторить
      </button>
    ) : null}
  </div>
);
