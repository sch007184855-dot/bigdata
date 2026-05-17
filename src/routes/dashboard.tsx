import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import AppSidebar from "@/components/AppSidebar";
import {
  Bike,
  BarChart3,
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
  avgBikes: number; // 대여소당 평균 자전거 보유량 (기준치 30)
  inUse: number; // 현재 시민들이 대여하여 이용 중인 자전거 수
};

// 서울시 25개 구 (대여소 수/면적/미반납/평균 보유량/대여중 데모 데이터)
// 기준: 대여소당 자전거 기준치 30대, 40대 초과 시 '밀집', 10대 미만 시 '부족'
const districts: DistrictRow[] = [
  { name: "강남구", stations: 178, area: 39.5, unreturned: 42, avgBikes: 44, inUse: 612 },
  { name: "강동구", stations: 112, area: 24.6, unreturned: 18, avgBikes: 31, inUse: 284 },
  { name: "강북구", stations: 64, area: 23.6, unreturned: 9, avgBikes: 8, inUse: 96 },
  { name: "강서구", stations: 156, area: 41.4, unreturned: 27, avgBikes: 33, inUse: 402 },
  { name: "관악구", stations: 98, area: 29.6, unreturned: 21, avgBikes: 28, inUse: 245 },
  { name: "광진구", stations: 102, area: 17.0, unreturned: 16, avgBikes: 32, inUse: 268 },
  { name: "구로구", stations: 88, area: 20.1, unreturned: 14, avgBikes: 26, inUse: 198 },
  { name: "금천구", stations: 52, area: 13.0, unreturned: 8, avgBikes: 9, inUse: 78 },
  { name: "노원구", stations: 124, area: 35.4, unreturned: 19, avgBikes: 29, inUse: 312 },
  { name: "도봉구", stations: 58, area: 20.7, unreturned: 7, avgBikes: 7, inUse: 82 },
  { name: "동대문구", stations: 96, area: 14.2, unreturned: 22, avgBikes: 34, inUse: 256 },
  { name: "동작구", stations: 84, area: 16.4, unreturned: 13, avgBikes: 27, inUse: 198 },
  { name: "마포구", stations: 168, area: 23.9, unreturned: 35, avgBikes: 43, inUse: 548 },
  { name: "서대문구", stations: 78, area: 17.6, unreturned: 12, avgBikes: 25, inUse: 172 },
  { name: "서초구", stations: 145, area: 47.0, unreturned: 24, avgBikes: 41, inUse: 462 },
  { name: "성동구", stations: 110, area: 16.8, unreturned: 20, avgBikes: 35, inUse: 298 },
  { name: "성북구", stations: 92, area: 24.6, unreturned: 14, avgBikes: 26, inUse: 204 },
  { name: "송파구", stations: 162, area: 33.9, unreturned: 31, avgBikes: 42, inUse: 524 },
  { name: "양천구", stations: 86, area: 17.4, unreturned: 12, avgBikes: 24, inUse: 184 },
  { name: "영등포구", stations: 134, area: 24.6, unreturned: 26, avgBikes: 36, inUse: 386 },
  { name: "용산구", stations: 76, area: 21.9, unreturned: 11, avgBikes: 23, inUse: 156 },
  { name: "은평구", stations: 88, area: 29.7, unreturned: 13, avgBikes: 22, inUse: 174 },
  { name: "종로구", stations: 82, area: 23.9, unreturned: 17, avgBikes: 30, inUse: 218 },
  { name: "중구", stations: 70, area: 9.96, unreturned: 15, avgBikes: 28, inUse: 186 },
  { name: "중랑구", stations: 74, area: 18.5, unreturned: 11, avgBikes: 21, inUse: 142 },
];

const BIKE_BASELINE = 30;
const CROWDED_THRESHOLD = 40;
const SHORTAGE_THRESHOLD = 10;

function DashboardPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/login" });
  }, [isAdmin, navigate]);

  const enriched = useMemo(
    () =>
      districts.map((d) => ({
        ...d,
        density: +(d.stations / d.area).toFixed(2),
        status:
          d.avgBikes > CROWDED_THRESHOLD
            ? ("crowded" as const)
            : d.avgBikes < SHORTAGE_THRESHOLD
              ? ("shortage" as const)
              : ("normal" as const),
      })),
    [],
  );

  const topBikes = useMemo(
    () => [...enriched].sort((a, b) => b.avgBikes - a.avgBikes).slice(0, 5),
    [enriched],
  );
  const bottomBikes = useMemo(
    () => [...enriched].sort((a, b) => a.avgBikes - b.avgBikes).slice(0, 5),
    [enriched],
  );
  const unreturnedSorted = useMemo(
    () => [...enriched].sort((a, b) => b.unreturned - a.unreturned),
    [enriched],
  );

  const totalStations = enriched.reduce((s, d) => s + d.stations, 0);
  const totalUnreturned = enriched.reduce((s, d) => s + d.unreturned, 0);
  const totalInUse = enriched.reduce((s, d) => s + d.inUse, 0);
  const avgDensity = +(
    enriched.reduce((s, d) => s + d.density, 0) / enriched.length
  ).toFixed(2);

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
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
              서울시 25개 자치구의 자전거 배치 및 미반납 현황을 확인하세요 (기준치:
              대여소당 {BIKE_BASELINE}대, 밀집 {CROWDED_THRESHOLD}대 초과 / 부족{" "}
              {SHORTAGE_THRESHOLD}대 미만)
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
              label="평균 대여소 밀집도"
            />
            <SummaryCard
              icon={<AlertTriangle className="size-5 text-[oklch(0.62_0.22_15)]" />}
              iconBg="bg-danger-soft"
              value={totalUnreturned.toLocaleString()}
              label="미반납 자전거 (전체)"
            />
            <SummaryCard
              icon={<Bike className="size-5 text-[oklch(0.55_0.2_250)]" />}
              iconBg="bg-[oklch(0.95_0.04_250)]"
              value={`${totalInUse.toLocaleString()}대`}
              label="현재 대여 중 자전거"
            />
          </div>

          {/* Top / Bottom bikes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RankCard
              title="자전거 밀집 상위 5개 구"
              desc={`대여소당 평균 자전거 보유량이 가장 많은 자치구 (${CROWDED_THRESHOLD}대 초과 시 밀집)`}
              icon={<TrendingUp className="size-5 text-[oklch(0.62_0.22_15)]" />}
              iconBg="bg-danger-soft"
              rows={topBikes}
              accent="danger"
            />
            <RankCard
              title="자전거 부족 상위 5개 구"
              desc={`대여소당 평균 자전거 보유량이 가장 적은 자치구 (${SHORTAGE_THRESHOLD}대 미만 시 부족)`}
              icon={<TrendingDown className="size-5 text-[oklch(0.55_0.2_250)]" />}
              iconBg="bg-[oklch(0.95_0.04_250)]"
              rows={bottomBikes}
              accent="info"
            />
          </div>

          {/* Unreturned per district */}
          <div className="bg-card border border-border rounded-2xl">
            <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-bold">자치구별 미반납 자전거</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  30대 이상 심각 · 15~29대 주의 · 15대 미만 양호
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
  accent: "danger" | "info";
}) {
  const max = Math.max(...rows.map((r) => r.avgBikes));
  const barColor =
    accent === "danger" ? "bg-[oklch(0.62_0.22_15)]" : "bg-[oklch(0.55_0.2_250)]";

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
                  {r.avgBikes} <span className="text-xs">대/대여소</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${(r.avgBikes / max) * 100}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                대여소 {r.stations}개 · 면적 {r.area} km² · 대여중 {r.inUse}대
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
        const tone =
          r.unreturned >= 30
            ? "bg-[oklch(0.5_0.24_25)]"
            : r.unreturned >= 15
              ? "bg-[oklch(0.72_0.18_55)]"
              : "bg-[oklch(0.65_0.18_150)]";
        const label =
          r.unreturned >= 30 ? "심각" : r.unreturned >= 15 ? "주의" : "양호";
        const labelTone =
          r.unreturned >= 30
            ? "text-[oklch(0.5_0.24_25)]"
            : r.unreturned >= 15
              ? "text-[oklch(0.55_0.18_55)]"
              : "text-[oklch(0.5_0.18_150)]";
        return (
          <div
            key={r.name}
            className="px-6 py-3.5 grid grid-cols-[110px_1fr_60px_90px] items-center gap-4"
          >
            <span className="text-sm font-medium">{r.name}</span>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${tone}`}
                style={{ width: `${(r.unreturned / max) * 100}%` }}
              />
            </div>
            <span className={`text-xs font-semibold ${labelTone}`}>{label}</span>
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
