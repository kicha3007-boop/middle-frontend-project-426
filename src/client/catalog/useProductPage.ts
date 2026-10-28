import { useEffect, useState } from "react";

import { api, errorMessage, isAbortError } from "../api/client";
import type { ProductListQuery, ProductPage } from "../api/types";

type State = {
  // Последняя полученная выдача: пока грузится новая, на экране остаётся прежняя.
  data: ProductPage | undefined;
  // Для какого запроса получена data.
  dataKey: string | undefined;
  loading: boolean;
  error: string | undefined;
};

type Result = {
  data: ProductPage | undefined;
  loading: boolean;
  error: string | undefined;
  // data получена именно для текущего запроса, а не осталась от прежнего.
  fresh: boolean;
  reload: () => void;
};

// Выдача каталога. Новый запрос отменяет предыдущий, поэтому ответ на устаревшие
// фильтры на экран не попадает, даже если пришёл позже актуального.
export const useProductPage = (query: ProductListQuery): Result => {
  const [state, setState] = useState<State>({
    data: undefined,
    dataKey: undefined,
    loading: true,
    error: undefined,
  });
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify(query);

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: undefined }));
    api.products(JSON.parse(key) as ProductListQuery, controller.signal).then(
      (data) => setState({ data, dataKey: key, loading: false, error: undefined }),
      (error: unknown) => {
        if (!isAbortError(error)) {
          setState((current) => ({ ...current, loading: false, error: errorMessage(error) }));
        }
      },
    );
    return () => controller.abort();
  }, [key, attempt]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    fresh: state.dataKey === key && !state.loading,
    reload: () => setAttempt((value) => value + 1),
  };
};
