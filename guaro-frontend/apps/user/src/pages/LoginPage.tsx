import { useState } from "react";
import { useAuth } from "@/store/auth";
import { devUsers } from "@guaro/mock-data";

export function LoginPage() {
  const { login, isDevMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDevLogin(email: string) {
    setLoading(true);
    setError("");
    try {
      await login(email);
    } catch {
      setError("Login failed — make sure the backend is running");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
      <div className="card p-8 w-80">
        <div className="flex items-center gap-3 mb-6">
          <img
            src="https://web.didiglobal.com/static/superapp/img/logo_white.png"
            alt="DiDi"
            className="w-8 h-8 object-contain rounded bg-accent p-1"
          />
          <div>
            <p className="text-sm font-semibold text-text-primary">Guaro</p>
            <p className="text-[11px] text-text-tertiary">User workspace</p>
          </div>
        </div>

        {isDevMode ? (
          <div>
            <p className="text-xs font-medium text-text-secondary mb-3">
              Dev mode — select a user:
            </p>
            <div className="space-y-1.5">
              {devUsers.map(({ user, label }) => (
                <button
                  key={user.id}
                  onClick={() => handleDevLogin(user.email)}
                  disabled={loading}
                  className="btn btn-secondary btn-sm w-full justify-start gap-2 disabled:opacity-50"
                >
                  <div className="text-left">
                    <p className="text-xs font-medium">{user.name}</p>
                    <p className="text-[10px] text-text-tertiary">{label}</p>
                  </div>
                </button>
              ))}
            </div>
            {error && <p className="text-xs text-danger-text mt-3">{error}</p>}
          </div>
        ) : (
          <div>
            <a
              href="http://localhost:3000/api/auth/google"
              className="btn btn-primary w-full justify-center"
            >
              Sign in with Google
            </a>

            <p className="text-[11px] text-text-tertiary text-center mt-3">
              Only @didi-labs.com accounts allowed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
