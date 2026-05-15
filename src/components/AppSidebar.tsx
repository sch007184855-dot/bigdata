import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  Bike,
  BarChart3,
  MapPinned,
  MessageSquare,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Map as MapIcon,
  Search,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const COLLAPSE_KEY = "ttareungi_sidebar_collapsed";

/* ───── 메뉴 항목 정의 ───── */
type MenuItem = {
  to: string;
  icon: React.ReactNode;
  label: string;
};

const userMainMenu: MenuItem[] = [
  { to: "/", icon: <MapIcon className="size-4" />, label: "내 주변 대여소" },
  { to: "/map-full", icon: <MapPinned className="size-4" />, label: "대여소 지도 전체보기" },
  { to: "/chatbot", icon: <MessageSquare className="size-4" />, label: "챗봇" },
  { to: "/history", icon: <History className="size-4" />, label: "이용내역" },
  { to: "/search-station", icon: <Search className="size-4" />, label: "대여소 찾기" },
];

const adminMainMenu: MenuItem[] = [
  { to: "/dashboard", icon: <BarChart3 className="size-4" />, label: "대시보드" },
  { to: "/stations", icon: <Bike className="size-4" />, label: "대여소 현황" },
];

const sharedBottomMenu: MenuItem[] = [
  { to: "/notifications", icon: <Bell className="size-4" />, label: "알림" },
  { to: "/help", icon: <HelpCircle className="size-4" />, label: "도움말" },
  { to: "/settings", icon: <Settings className="size-4" />, label: "설정" },
];

/* ───── 공통 사이드바 ───── */
export default function AppSidebar() {
  const { isAdmin, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  /* localStorage에서 접힘 상태 복원 */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(COLLAPSE_KEY);
    if (saved === "1") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  };

  const mainMenu = isAdmin ? adminMainMenu : userMainMenu;

  return (
    <aside
      className={`shrink-0 bg-card border-r border-border flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* 로고 + 접기 버튼 */}
      <div className="px-3 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
            <Bike className="size-5 text-primary" strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-base leading-tight">따릉이</div>
              <div className="text-xs text-muted-foreground">빅데이터 플랫폼</div>
            </div>
          )}
        </div>
        <button
          onClick={toggle}
          title={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
          className="shrink-0 size-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* 메인 메뉴 */}
      <nav className="px-2 mt-1 flex-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-2 text-xs text-muted-foreground mb-2">메인 메뉴</div>
        )}
        <ul className="space-y-1">
          {mainMenu.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              active={currentPath === item.to}
              collapsed={collapsed}
            />
          ))}
          <NavItem
            item={{ to: "/qna", icon: <MessageSquare className="size-4" />, label: "Q&A 게시판" }}
            active={currentPath === "/qna"}
            collapsed={collapsed}
          />
        </ul>
      </nav>

      {/* 하단 메뉴 */}
      <div className="px-2 pb-2 space-y-1">
        {sharedBottomMenu.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            active={currentPath === item.to}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* 프로필 / 로그인 */}
      {isAdmin ? (
        <div
          className={`mx-2 mb-3 p-2 rounded-xl bg-muted/60 flex items-center gap-2 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="size-9 rounded-full bg-foreground/85 text-background text-xs font-semibold flex items-center justify-center shrink-0">
            관
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight">관리자</div>
                <div className="text-xs text-muted-foreground truncate">admin@seoul.go...</div>
              </div>
              <button
                onClick={logout}
                title="로그아웃"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="size-4" />
              </button>
            </>
          )}
        </div>
      ) : (
        !collapsed && (
          <Link
            to="/login"
            className="mx-2 mb-3 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium text-center hover:opacity-90 transition-opacity"
          >
            관리자 로그인
          </Link>
        )
      )}
    </aside>
  );
}

/* ───── NavItem ───── */
function NavItem({
  item,
  active,
  collapsed,
}: {
  item: MenuItem;
  active: boolean;
  collapsed: boolean;
}) {
  const base = `w-full flex items-center gap-3 rounded-lg text-sm transition-colors ${
    active
      ? "bg-primary text-primary-foreground font-medium shadow-sm"
      : "text-foreground/80 hover:bg-muted"
  }`;

  const content = (
    <>
      <span className="shrink-0 flex items-center justify-center size-8">
        {item.icon}
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </>
  );

  return (
    <li title={collapsed ? item.label : undefined}>
      <Link to={item.to} className={`${base} ${collapsed ? "justify-center px-1 py-2" : "px-3 py-2.5"}`}>
        {content}
      </Link>
    </li>
  );
}
