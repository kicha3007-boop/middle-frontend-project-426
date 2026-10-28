import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";

import { errorMessage } from "../api/client";
import type { Credentials } from "../api/types";
import { useAuth } from "./AuthContext";

type Mode = "signin" | "signup";

const TEXTS: Record<Mode, { title: string; submit: string; switchText: string; switchTo: string }> =
  {
    signin: {
      title: "Вход",
      submit: "Войти",
      switchText: "Нет аккаунта? Зарегистрируйтесь",
      switchTo: "/signup",
    },
    signup: {
      title: "Регистрация",
      submit: "Зарегистрироваться",
      switchText: "Уже есть аккаунт? Войдите",
      switchTo: "/signin",
    },
  };

// После входа возвращаемся туда, откуда пришли, но только на свой же сайт.
const safeNext = (value: string | null): string =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/";

export const AuthForm = ({ mode }: { mode: Mode }) => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [credentials, setCredentials] = useState<Credentials>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const texts = TEXTS[mode];

  if (user && !submitting) {
    return <Navigate to={next} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!credentials.email.trim() || credentials.password.length < 6) {
      setError("Введите email и пароль не короче 6 символов");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await (mode === "signin" ? signIn : signUp)({
        email: credentials.email.trim(),
        password: credentials.password,
      });
      navigate(next, { replace: true });
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const linkSearch = next === "/" ? "" : `?next=${encodeURIComponent(next)}`;

  return (
    <div className="auth">
      <h1 className="page-title">{texts.title}</h1>
      <form className="auth-form" noValidate onSubmit={(event) => void handleSubmit(event)}>
        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            data-testid="auth-email"
            autoComplete="email"
            value={credentials.email}
            onChange={(event) =>
              setCredentials((current) => ({ ...current, email: event.target.value }))
            }
          />
        </label>
        <label className="field">
          <span className="field-label">Пароль</span>
          <input
            type="password"
            data-testid="auth-password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={credentials.password}
            onChange={(event) =>
              setCredentials((current) => ({ ...current, password: event.target.value }))
            }
          />
          {mode === "signup" ? <span className="muted">Не короче 6 символов</span> : null}
        </label>
        {error ? (
          <p className="alert alert-error" role="alert" data-testid="auth-error">
            {error}
          </p>
        ) : null}
        <button type="submit" className="button" data-testid="auth-submit" disabled={submitting}>
          {texts.submit}
        </button>
      </form>
      <p>
        <Link to={`${texts.switchTo}${linkSearch}`}>{texts.switchText}</Link>
      </p>
    </div>
  );
};
