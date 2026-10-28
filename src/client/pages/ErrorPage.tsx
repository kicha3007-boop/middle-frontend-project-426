import { useEffect } from "react";
import { useRouteError } from "react-router";

import { captureError } from "../monitoring";

// Ошибка отрисовки любой страницы: показываем понятное сообщение и отправляем её в мониторинг.
export const ErrorPage = () => {
  const error = useRouteError();

  useEffect(() => {
    captureError(error);
  }, [error]);

  return (
    <div className="container main">
      <div className="alert alert-error" role="alert">
        <h1>Что-то пошло не так</h1>
        <p>Мы уже знаем об ошибке. Попробуйте обновить страницу.</p>
        <a href="/">На главную</a>
      </div>
    </div>
  );
};
