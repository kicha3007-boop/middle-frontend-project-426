import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";

import { Loader } from "../components/Loader";
import { useAuth } from "./AuthContext";

// Страница только для авторизованных. Аноним уходит на вход, после входа вернётся обратно.
// Данные таких страниц сервер всё равно отдаёт только по сессии.
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (user === undefined) {
    return <Loader />;
  }
  if (user === null) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/signin?next=${encodeURIComponent(next)}`} replace />;
  }
  return children;
};
