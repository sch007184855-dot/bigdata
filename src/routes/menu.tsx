import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Bike, BarChart3, MessageSquare, LogOut } from "lucide-react";

export const Route = createFileRoute("/menu")({
  component: MenuPage,
});

const items = [
  {
    to: "/dashboard" as const,
    icon: BarChart3,
    title: "대시보드",
    desc: "구별 대여소 밀집도 및 미반납 자전거 현황",
    iconBg: "bg-primary-soft",
    iconColor: "text-primary",
  },
  {
    to: null,
    icon: Bike,
    title: "대여소 관리",
    desc: "대여소 등록/수정 및 운영 상태 관리",
    iconBg: "bg-success-soft",
    iconColor: "text-[oklch(0.55_0.15_155)]",
  },
  {
    to: null,
    icon: MessageSquare,
    title: "Q&A 게시판",
    desc: "사용자 문의 확인 및 응답",
    iconBg: "bg-warning-soft",
    iconColor: "text-[oklch(0.65_0.15_70)]",
  },
];

function MenuPage() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/login" });
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center mb-10">
          <div className="size-14 rounded-2xl bg-primary-soft flex items-center justify-center mb-4">
            <Bike className="size-7 text-primary" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold">메뉴 선택</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            이용하실 메뉴를 선택해주세요
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {items.map((it) => {
            const Icon = it.icon;
            const inner = (
              <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-md hover:border-primary/30 transition-all h-full flex flex-col items-center">
                <div
                  className={`size-14 rounded-2xl flex items-center justify-center ${it.iconBg} mb-4`}
                >
                  <Icon className={`size-7 ${it.iconColor}`} />
                </div>
                <div className="font-semibold">{it.title}</div>
                <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {it.desc}
                </div>
              </div>
            );
            return it.to ? (
              <Link key={it.title} to={it.to} className="block">
                {inner}
              </Link>
            ) : (
              <button key={it.title} className="block text-left">
                {inner}
              </button>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
