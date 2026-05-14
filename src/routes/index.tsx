import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  Calendar as CalendarIcon,
  Download,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

type StationStatus = "available" | "normal" | "shortage";

const stations: { id: number; x: number; y: number; count: number; status: StationStatus }[] = [
  { id: 1, x: 38, y: 38, count: 5, status: "shortage" },
  { id: 2, x: 28, y: 50, count: 8, status: "normal" },
  { id: 3, x: 50, y: 56, count: 3, status: "shortage" },
  { id: 4, x: 60, y: 50, count: 18, status: "available" },
  { id: 5, x: 76, y: 56, count: 7, status: "normal" },
  { id: 6, x: 22, y: 65, count: 12, status: "available" },
  { id: 7, x: 50, y: 70, count: 15, status: "available" },
  { id: 8, x: 62, y: 72, count: 9, status: "normal" },
];

const eventDays = [15, 20, 25, 28];

function Index() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <div className="flex-1 px-8 py-6 space-y-6 overflow-x-hidden">
          <PageHeader />
          <StatsGrid />
          <MapPanel />
          <QuickActions />
          <EventCalendar selectedDay={selectedDay} onSelect={setSelectedDay} />
        </div>
      </main>
    </div>
  );
}

/* ---------------- Sidebar ---------------- */
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
          <NavItem to="/" icon={<MapIcon className="size-4" />} label={isAdmin ? "지도뷰" : "내 주변 대여소"} active />
          {isAdmin && (
            <>
              <NavItem to="/dashboard" icon={<BarChart3 className="size-4" />} label="대시보드" />
              <NavItem icon={<Bike className="size-4" />} label="대여소 관리" />
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

      {isAdmin ? (
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
      ) : (
        <Link
          to="/login"
          className="mx-3 mb-4 mt-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium text-center hover:opacity-90 transition-opacity"
        >
          관리자 로그인
        </Link>
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

/* ---------------- Top Bar ---------------- */
function TopBar() {
  return (
    <div className="h-16 px-8 flex items-center gap-4 border-b border-border bg-card/40">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="대여소 검색..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <button className="h-10 px-4 rounded-xl bg-card border border-border text-sm flex items-center gap-2 hover:bg-muted transition-colors">
        <CalendarIcon className="size-4 text-muted-foreground" />
        2024.01.15
      </button>
      <button className="h-10 px-4 rounded-xl bg-card border border-border text-sm flex items-center gap-2 hover:bg-muted transition-colors">
        <Download className="size-4 text-muted-foreground" />
        리포트
      </button>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold">지도뷰</h1>
      <p className="text-sm text-muted-foreground mt-1">
        서울시 공공자전거 실시간 현황을 확인하세요
      </p>
    </div>
  );
}

/* ---------------- Stats ---------------- */
function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <StatCard
        icon={<Bike className="size-5 text-primary" />}
        iconBg="bg-primary-soft"
        value="15,234"
        label="오늘 대여 건수"
        delta="12.5%"
        deltaUp
      />
      <StatCard
        icon={<Users className="size-5 text-[oklch(0.55_0.15_155)]" />}
        iconBg="bg-success-soft"
        value="2,847"
        label="실시간 이용자"
        delta="5.2%"
        deltaUp
      />
      <StatCard
        icon={<MapPin className="size-5 text-primary" />}
        iconBg="bg-primary-soft"
        value="2,154"
        label="운영 대여소"
        topRight={
          <div className="text-right">
            <div className="text-sm font-semibold">98.5%</div>
            <div className="text-xs text-muted-foreground">가동률</div>
          </div>
        }
      />
      <StatCard
        icon={<TrendingUp className="size-5 text-[oklch(0.65_0.15_70)]" />}
        iconBg="bg-warning-soft"
        value="32분"
        label="평균 이용시간"
        delta="2.3%"
        deltaUp={false}
      />
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
  delta,
  deltaUp,
  topRight,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  delta?: string;
  deltaUp?: boolean;
  topRight?: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between">
        <div className={`size-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {topRight ??
          (delta && (
            <div
              className={`text-sm font-medium flex items-center gap-1 ${
                deltaUp ? "text-[oklch(0.6_0.18_155)]" : "text-[oklch(0.6_0.22_15)]"
              }`}
            >
              {deltaUp ? (
                <ArrowUpRight className="size-4" />
              ) : (
                <ArrowDownRight className="size-4" />
              )}
              {delta}
            </div>
          ))}
      </div>
      <div className="mt-8">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

/* ---------------- Map Panel ---------------- */
function MapPanel() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold">실시간 대여소 현황</h3>
          <p className="text-sm text-muted-foreground mt-1">
            서울시 공공자전거 대여소 위치 및 현황
          </p>
        </div>
        <div className="flex gap-2">
          <button className="h-9 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted transition-colors">
            <RefreshCw className="size-4" />
            새로고침
          </button>
          <button className="h-9 px-3 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted transition-colors">
            <Navigation className="size-4" />
            현재 위치
          </button>
        </div>
      </div>

      <div className="relative mx-6 mb-6 h-[420px] rounded-xl bg-[oklch(0.97_0.005_250)] overflow-hidden border border-border">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.92 0.005 250) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.92 0.005 250) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Roads */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 bg-[oklch(0.85_0.01_250)]" />
        <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 bg-[oklch(0.85_0.01_250)]" />
        <div className="absolute inset-0">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <line
              x1="20%" y1="20%" x2="80%" y2="80%"
              stroke="oklch(0.88 0.005 250)" strokeWidth="2" strokeDasharray="6 6"
            />
            <line
              x1="80%" y1="20%" x2="20%" y2="80%"
              stroke="oklch(0.88 0.005 250)" strokeWidth="2" strokeDasharray="6 6"
            />
          </svg>
        </div>

        {/* Markers */}
        {stations.map((s) => (
          <StationMarker key={s.id} {...s} />
        ))}

        {/* Map controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <MapControl icon={<ZoomIn className="size-4" />} />
          <MapControl icon={<ZoomOut className="size-4" />} />
          <MapControl icon={<Layers className="size-4" />} />
        </div>
      </div>

      <div className="px-6 pb-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-5 text-sm">
          <Legend color="oklch(0.7 0.16 155)" label="여유 (10+)" />
          <Legend color="oklch(0.78 0.15 70)" label="보통 (5-10)" />
          <Legend color="oklch(0.62 0.22 15)" label="부족 (5-)" />
        </div>
        <div className="text-xs text-muted-foreground">마지막 업데이트: 방금 전</div>
      </div>
    </div>
  );
}

function StationMarker({
  x,
  y,
  count,
  status,
}: {
  x: number;
  y: number;
  count: number;
  status: StationStatus;
}) {
  const colors: Record<StationStatus, string> = {
    available: "bg-[oklch(0.7_0.16_155)]",
    normal: "bg-[oklch(0.78_0.15_70)]",
    shortage: "bg-[oklch(0.62_0.22_15)]",
  };
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div
        className={`${colors[status]} text-white text-xs font-bold size-9 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/70 cursor-pointer hover:scale-110 transition-transform`}
      >
        {count}
      </div>
    </div>
  );
}

function MapControl({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="size-9 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center hover:bg-muted transition-colors">
      {icon}
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2.5 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

/* ---------------- Quick Actions ---------------- */
function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      <ActionCard
        icon={<MapPinned className="size-5 text-primary" />}
        iconBg="bg-primary-soft"
        title="대여소 지도 전체보기"
        desc="서울시 전체 ..."
      />
      <ActionCard
        icon={<MessageSquare className="size-5 text-[oklch(0.55_0.15_155)]" />}
        iconBg="bg-success-soft"
        title="챗봇"
        desc="AI 상담 서비스"
      />
      <ActionCard
        icon={<History className="size-5 text-primary" />}
        iconBg="bg-primary-soft"
        title="이용내역"
        desc="대여/반납 기..."
      />
      <ActionCard
        icon={<Search className="size-5 text-[oklch(0.65_0.15_70)]" />}
        iconBg="bg-warning-soft"
        title="대여소 찾기"
        desc="주변 대여소 ..."
      />
    </div>
  );
}

function ActionCard({
  icon,
  iconBg,
  title,
  desc,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
}) {
  return (
    <button className="bg-card border border-border rounded-2xl p-5 text-left flex items-center gap-4 hover:shadow-md hover:border-primary/30 transition-all">
      <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-sm leading-tight">{title}</div>
        <div className="text-xs text-muted-foreground mt-1 truncate">{desc}</div>
      </div>
    </button>
  );
}

/* ---------------- Calendar ---------------- */
function EventCalendar({
  selectedDay,
  onSelect,
}: {
  selectedDay: number | null;
  onSelect: (d: number) => void;
}) {
  // May 2026: starts Friday (1st), 31 days
  const firstDayOffset = 5; // Sun=0 ... Fri=5
  const daysInMonth = 31;
  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold">도시 행사 캘린더</h3>
            <div className="flex items-center gap-3 text-sm">
              <button className="size-7 rounded-md hover:bg-muted flex items-center justify-center">
                <ChevronLeft className="size-4" />
              </button>
              <span className="font-medium">2026년 5월</span>
              <button className="size-7 rounded-md hover:bg-muted flex items-center justify-center">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-sm">
            {dayLabels.map((d, i) => (
              <div
                key={d}
                className={`text-center py-2 font-medium ${
                  i === 0
                    ? "text-[oklch(0.62_0.22_15)]"
                    : i === 6
                      ? "text-[oklch(0.55_0.18_240)]"
                      : "text-muted-foreground"
                }`}
              >
                {d}
              </div>
            ))}
            {cells.map((day, idx) => {
              const dow = idx % 7;
              const hasEvent = day !== null && eventDays.includes(day);
              const isSelected = day !== null && selectedDay === day;
              return (
                <button
                  key={idx}
                  disabled={day === null}
                  onClick={() => day !== null && onSelect(day)}
                  className={`relative aspect-square rounded-lg text-sm transition-colors ${
                    day === null
                      ? ""
                      : isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : hasEvent
                          ? "bg-primary-soft text-primary font-semibold hover:bg-primary/15"
                          : dow === 0
                            ? "text-[oklch(0.62_0.22_15)] hover:bg-muted"
                            : dow === 6
                              ? "text-[oklch(0.55_0.18_240)] hover:bg-muted"
                              : "hover:bg-muted"
                  }`}
                >
                  {day}
                  {hasEvent && (
                    <span
                      className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 size-1.5 rounded-full ${
                        isSelected ? "bg-primary-foreground" : "bg-primary"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:border-l lg:border-border lg:pl-8">
          <h4 className="font-semibold mb-3">
            {selectedDay ? `5월 ${selectedDay}일 행사` : "날짜를 선택하세요"}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {selectedDay
              ? "이 날짜에 예정된 도시 행사가 곧 업데이트됩니다."
              : "캘린더에서 날짜를 클릭하면 해당 날짜의 행사를 확인할 수 있습니다."}
          </p>
        </div>
      </div>
    </div>
  );
}
