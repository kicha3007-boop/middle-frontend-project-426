import { useEffect, useRef, useState } from "react";

import { ApiError, errorMessage, isAbortError } from "../api/client";

// Состояние загрузки одним значением: «загрузка» и «ошибка» не бывают истинными одновременно.
export type Remote<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string; notFound: boolean };

// Загружает данные при смене ключа и отменяет устаревший запрос: ответ на прежний ключ
// на экран не попадёт. reload() повторяет запрос с тем же ключом.
export const useRemote = <T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
): { state: Remote<T>; reload: () => void } => {
  const [state, setState] = useState<Remote<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  // load меняется на каждом рендере, поэтому запрос определяется ключом, а функция
  // берётся последняя.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    loadRef.current(controller.signal).then(
      (data) => setState({ status: "success", data }),
      (error: unknown) => {
        if (!isAbortError(error)) {
          setState({
            status: "error",
            message: errorMessage(error),
            notFound: error instanceof ApiError && error.status === 404,
          });
        }
      },
    );
    return () => controller.abort();
  }, [key, attempt]);

  return { state, reload: () => setAttempt((value) => value + 1) };
};
