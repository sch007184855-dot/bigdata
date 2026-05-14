import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type DistrictRow = {
  name: string;
  stations: number; // 대여소 수
  area: number; // km²
  unreturned: number; // 미반납 자전거
};

// 서울시 25개 구 (대여소 수/면적/미반납 데모 데이터)
const districts: DistrictRow[] = [
  { name: "강남구", stations: 178, area: 39.5, unreturned: 42 },
  { name: "강동구", stations: 112, area: 24.6, unreturned: 18 },
  { name: "강북구", stations: 64, area: 23.6, unreturned: 9 },
  { name: "강서구", stations: 156, area: 41.4, unreturned: 27 },
  { name: "관악구", stations: 98, area: 29.6, unreturned: 21 },
  { name: "광진구", stations: 102, area: 17.0, unreturned: 16 },
  { name: "구로구", stations: 88, area: 20.1, unreturned: 14 },
  { name: "금천구", stations: 52, area: 13.0, unreturned: 8 },
  { name: "노원구", stations: 124, area: 35.4, unreturned: 19 },
  { name: "도봉구", stations: 58, area: 20.7, unreturned: 7 },
  { name: "동대문구", stations: 96, area: 14.2, unreturned: 22 },
  { name: "동작구", stations: 84, area: 16.4, unreturned: 13 },
  { name: "마포구", stations: 168, area: 23.9, unreturned: 35 },
  { name: "서대문구", stations: 78, area: 17.6, unreturned: 12 },
  { name: "서초구", stations: 145, area: 47.0, unreturned: 24 },
  { name: "성동구", stations: 110, area: 16.8, unreturned: 20 },
  { name: "성북구", stations: 92, area: 24.6, unreturned: 14 },
  { name: "송파구", stations: 162, area: 33.9, unreturned: 31 },
  { name: "양천구", stations: 86, area: 17.4, unreturned: 12 },
  { name: "영등포구", stations: 134, area: 24.6, unreturned: 26 },
  { name: "용산구", stations: 76, area: 21.9, unreturned: 11 },
  { name: "은평구", stations: 88, area: 29.7, unreturned: 13 },
  { name: "종로구", stations: 82, area: 23.9, unreturned: 17 },
  { name: "중구", stations: 70, area: 9.96, unreturned: 15 },
  { name: "중랑구", stations: 74, area: 18.5, unreturned: 11 },
];

function DashboardPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/login" });
  }, [isAdmin, navigate]);

  const withDensity = useMemo(
    () =>
      districts.map((d) => ({
        ...d,
        density: +(d.stations / d.area).toFixed(2),
      })),
    [],
  );

  const top5 = useMemo(
    () => [...withDensity].sort((a, b) => b.density - a.density).slice(0, 5),
    [withDensity],
  );
  const bottom5 = useMemo(
    () => [...withDensity].sort((a, b) => a.density - b.density).slice(0, 5),
    [withDensity],
  );
  const unreturnedSorted = useMemo(
    () => [...withDensity].sort((a, b) => b.unreturned - a.unreturned),
    [withDensity],
  );

  const totalStations = withDensity.reduce((s, d) => s + d.stations, 0);
  const totalUnreturned = withDensity.reduce((s, d) => s + d.unreturned, 0);
  const avgDensity = +(
    withDensity.reduce((s, d) => s + d.density, 0) / withDensity.length
  ).toFixed(2);

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="h-16 px-8 flex items-center border-b border-border bg-card/40">
          <div>
            <div className="text-xs text-muted-foreground">관리자 메뉴</div>
            <div className="text-sm font-semibold">대시보드</div>
          </div>
        </div>

        <div className="flex-1 px-8 py-6 space-y-6 overflow-x-hidden">
          <div>
            <h1 className="text-2xl font-bold">자치구 대시보드</h1>
            <p className="text-sm text-muted-foreground mt-1">
              서울시 25개 자치구의 대여소 밀집도와 미반납 현황을 확인하세요
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SummaryCard
              icon={<MapPin className="size-5 text-primary" />}
              iconBg="bg-primary-soft"
              value={totalStations.toLocaleString()}
              label="전체 대여소"
            />
            <SummaryCard
              icon={<BarChart3 className="size-5 text-[oklch(0.55_0.15_155)]" />}
              iconBg="bg-success-soft"
              value={`${avgDensity} /km²`}
              label="평균 밀집도"
            />
            <SummaryCard
              icon={<AlertTriangle className="size-5 text-[oklch(0.62_0.22_15)]" />}
              iconBg="bg-danger-soft"
              value={totalUnreturned.toLocaleString()}
              label="미반납 자전거 (전체)"
            />
          </div>

          {/* Top / Bottom density */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RankCard
              title="대여소 밀집 상위 5개 구"
              desc="단위 면적(km²)당 대여소 수가 가장 많은 자치구"
              icon={<TrendingUp className="size-5 text-[oklch(0.55_0.15_155)]" />}
              iconBg="bg-success-soft"
              rows={top5}
              accent="success"
            />
            <RankCard
              title="대여소 밀집 하위 5개 구"
              desc="단위 면적(km²)당 대여소 수가 가장 적은 자치구"
              icon={<TrendingDown className="size-5 text-[oklch(0.62_0.22_15)]" />}
              iconBg="bg-danger-soft"
              rows={bottom5}
              accent="danger"
            />
          </div>

          {/* Unreturned per district */}
          <div className="bg-card border border-border rounded-2xl">
            <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-bold">자치구별 미반납 자전거</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  미반납 건수가 많은 순서로 정렬됩니다
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                전체 <span className="font-semibold text-foreground">{totalUnreturned}</span>대
              </div>
            </div>
            <UnreturnedList rows={unreturnedSorted} />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- Sub components ---------------- */

function SummaryCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className={`size-12 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
      <div className="mt-6">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function RankCard({
  title,
  desc,
  icon,
  iconBg,
  rows,
  accent,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  rows: (DistrictRow & { density: number })[];
  accent: "success" | "danger";
}) {
  const max = Math.max(...rows.map((r) => r.density));
  const barColor =
    accent === "success" ? "bg-[oklch(0.7_0.16_155)]" : "bg-[oklch(0.62_0.22_15)]";

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <div className={`size-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {rows.map((r, i) => (
          <li key={r.name} className="flex items-center gap-3">
            <span className="size-7 rounded-lg bg-muted text-xs font-semibold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{r.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {r.density} <span className="text-xs">/km²</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${(r.density / max) * 100}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                대여소 {r.stations}개 · 면적 {r.area} km²
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UnreturnedList({ rows }: { rows: (DistrictRow & { density: number })[] }) {
  const max = Math.max(...rows.map((r) => r.unreturned));
  return (
    <div className="divide-y divide-border">
      {rows.map((r) => {
        const ratio = r.unreturned / max;
        const tone =
          ratio > 0.66
            ? "bg-[oklch(0.62_0.22_15)]"
            : ratio > 0.33
              ? "bg-[oklch(0.78_0.15_70)]"
              : "bg-[oklch(0.7_0.16_155)]";
        return (
          <div key={r.name} className="px-6 py-3.5 grid grid-cols-[110px_1fr_90px] items-center gap-4">
            <span className="text-sm font-medium">{r.name}</span>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${tone}`}
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
            <span className="text-sm text-right tabular-nums">
              <span className="font-semibold">{r.unreturned}</span>
              <span className="text-muted-foreground"> 대</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Sidebar (shared shape with index) ---------------- */
function Sidebar() {
  const { isAdmin, logout } = useAuth();
  return (
    <aside className="w-64 shrink-0 bg-card border-r border-border flex flex-col">
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="size-11 rounded-xl bg-primary-soft flex items-center justify-center">
          <Bike className="size-6 text-primary" strokeWidth={2.2} />
        </div>
        <div>
          <div className="font-bold text-base leading-tight">따릉이</div>
          <div className="text-xs text-muted-foreground">빅데이터 플랫폼</div>
        </div>
      </div>

      <nav className="px-3 mt-2 flex-1">
        <div className="px-2 text-xs text-muted-foreground mb-2">메인 메뉴</div>
        <ul className="space-y-1">
          
          {isAdmin && (
            <>
              <NavItem to="/dashboard" icon={<BarChart3 className="size-4" />} label="대시보드" active />
              <NavItem to="/stations" icon={<Bike className="size-4" />} label="대여소 현황" />
            </>
          )}
          <NavItem icon={<MessageSquare className="size-4" />} label="Q&A 게시판" />
        </ul>
      </nav>

      <div className="px-3 pb-3 space-y-1">
        <NavItem icon={<Bell className="size-4" />} label="알림" />
        <NavItem icon={<HelpCircle className="size-4" />} label="도움말" />
        <NavItem icon={<Settings className="size-4" />} label="설정" />
      </div>

      {isAdmin && (
        <div className="mx-3 mb-4 mt-2 p-3 rounded-xl bg-muted/60 flex items-center gap-3">
          <div className="size-9 rounded-full bg-foreground/85 text-background text-xs font-semibold flex items-center justify-center">
            관
          </div>
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
        </div>
      )}
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  to?: string;
}) {
  const cls = `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
    active
      ? "bg-primary text-primary-foreground font-medium shadow-sm"
      : "text-foreground/80 hover:bg-muted"
  }`;
  return (
    <li>
      {to ? (
        <Link to={to} className={cls}>
          {icon}
          <span>{label}</span>
        </Link>
      ) : (
        <button className={cls}>
          {icon}
          <span>{label}</span>
        </button>
      )}
    </li>
  );
}
