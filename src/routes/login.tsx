import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Bike, Lock, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  if (isAdmin) {
    navigate({ to: "/menu" });
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = login(id, pw);
    if (res.ok) {
      navigate({ to: "/menu" });
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="size-14 rounded-2xl bg-primary-soft flex items-center justify-center mb-4">
            <Bike className="size-7 text-primary" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold">관리자 로그인</h1>
          <p className="text-sm text-muted-foreground mt-1.5">따릉이 빅데이터 플랫폼</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-card border border-border rounded-2xl p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1.5">아이디</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-[oklch(0.6_0.22_15)] bg-danger-soft rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            로그인
          </button>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            데모 계정: <span className="font-mono">admin</span> /{" "}
            <span className="font-mono">admin1234</span>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← 일반 사용자로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
