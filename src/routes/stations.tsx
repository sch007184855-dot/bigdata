import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import AppSidebar from "@/components/AppSidebar";
import {
  Bike,
  ChevronLeft,
  MapPin,
  Battery,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/stations")({
  component: StationsPage,
});

/* ---------------- 데이터 ---------------- */
type District = {
  code: string;
  name: string;
  // 그리드 위치 (서울 25개 구의 대략적 배치)
  col: number;
  row: number;
  riverSide: "north" | "south";
};

const districts: District[] = [
  { code: "DB", name: "도봉구", col: 5, row: 1, riverSide: "north" },
  { code: "NW", name: "노원구", col: 6, row: 1, riverSide: "north" },
  { code: "GB", name: "강북구", col: 4, row: 2, riverSide: "north" },
  { code: "SB", name: "성북구", col: 5, row: 2, riverSide: "north" },
  { code: "JN", name: "중랑구", col: 6, row: 2, riverSide: "north" },
  { code: "EP", name: "은평구", col: 2, row: 2, riverSide: "north" },
  { code: "JR", name: "종로구", col: 4, row: 3, riverSide: "north" },
  { code: "JG", name: "중구", col: 4, row: 4, riverSide: "north" },
  { code: "SD", name: "서대문구", col: 3, row: 3, riverSide: "north" },
  { code: "MP", name: "마포구", col: 2, row: 3, riverSide: "north" },
  { code: "DD", name: "동대문구", col: 5, row: 3, riverSide: "north" },
  { code: "SE", name: "성동구", col: 5, row: 4, riverSide: "north" },
  { code: "GJ", name: "광진구", col: 6, row: 3, riverSide: "north" },
  { code: "GD", name: "강동구", col: 7, row: 4, riverSide: "north" },
  { code: "YS", name: "용산구", col: 3, row: 4, riverSide: "north" },
  // 한강 남쪽
  { code: "GS", name: "강서구", col: 1, row: 5, riverSide: "south" },
  { code: "YC", name: "양천구", col: 2, row: 5, riverSide: "south" },
  { code: "YD", name: "영등포구", col: 3, row: 5, riverSide: "south" },
  { code: "GR", name: "구로구", col: 2, row: 6, riverSide: "south" },
  { code: "GC", name: "금천구", col: 3, row: 6, riverSide: "south" },
  { code: "DJ", name: "동작구", col: 4, row: 5, riverSide: "south" },
  { code: "GA", name: "관악구", col: 4, row: 6, riverSide: "south" },
  { code: "SC", name: "서초구", col: 5, row: 5, riverSide: "south" },
  { code: "GN", name: "강남구", col: 6, row: 5, riverSide: "south" },
  { code: "SP", name: "송파구", col: 7, row: 5, riverSide: "south" },
];

type StationStatus = "available" | "normal" | "shortage" | "maintenance";

type Station = {
  id: string;
  name: string;
  district: string;
  totalSlots: number;
  availableBikes: number;
  status: StationStatus;
  battery: number; // 평균 배터리 %
  lastUpdate: string;
};

// 데모용: 각 구마다 4~6개의 배치소 생성
function generateStations(): Station[] {
  const list: Station[] = [];
  const base = [
    { suffix: "역 1번출구", slots: 20 },
    { suffix: "주민센터", slots: 15 },
    { suffix: "공원 입구", slots: 25 },
    { suffix: "사거리", slots: 18 },
    { suffix: "초등학교 앞", slots: 12 },
    { suffix: "시장 앞", slots: 16 },
  ];
  districts.forEach((d, di) => {
    const count = 4 + (di % 3);
    for (let i = 0; i < count; i++) {
      const b = base[i % base.length];
      const seed = (di * 7 + i * 13) % 100;
      const available = Math.max(0, Math.min(b.slots, Math.floor((seed / 100) * b.slots)));
      const ratio = available / b.slots;
      let status: StationStatus = "normal";
      if (seed % 17 === 0) status = "maintenance";
      else if (ratio >= 0.6) status = "available";
      else if (ratio < 0.25) status = "shortage";
      list.push({
        id: `${d.code}-${i + 1}`,
        name: `${d.name.slice(0, -1)} ${b.suffix}`,
        district: d.name,
        totalSlots: b.slots,
        availableBikes: available,
        status,
        battery: 60 + ((seed * 3) % 40),
        lastUpdate: `${(seed % 9) + 1}분 전`,
      });
    }
  });
  return list;
}

const allStations = generateStations();

/* ---------------- 페이지 ---------------- */
function StationsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/login" });
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const stationsInDistrict = useMemo(
    () =>
      selectedDistrict
        ? allStations.filter((s) => s.district === selectedDistrict)
        : [],
    [selectedDistrict],
  );

  const station = useMemo(
    () => allStations.find((s) => s.id === selectedStation) ?? null,
    [selectedStation],
  );

  const districtStats = useMemo(() => {
    const map = new Map<string, number>();
    allStations.forEach((s) => map.set(s.district, (map.get(s.district) ?? 0) + 1));
    return map;
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-6 sm:px-8 border-b border-border bg-card flex items-center gap-4">
        <Link
          to="/menu"
          className="size-9 rounded-lg hover:bg-muted flex items-center justify-center"
          aria-label="메뉴로"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="size-9 rounded-xl bg-primary-soft flex items-center justify-center">
          <Bike className="size-5 text-primary" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base leading-tight">대여소 현황</div>
          <div className="text-xs text-muted-foreground truncate">
            {selectedStation
              ? `${station?.district} › ${station?.name}`
              : selectedDistrict
                ? `서울시 › ${selectedDistrict}`
                : "서울시 25개 자치구"}
          </div>
        </div>
        {(selectedDistrict || selectedStation) && (
          <button
            onClick={() => {
              if (selectedStation) setSelectedStation(null);
              else setSelectedDistrict(null);
            }}
            className="h-9 px-3 rounded-lg border border-border text-sm hover:bg-muted"
          >
            ← 뒤로
          </button>
        )}
      </header>

      <main className="flex-1 px-6 sm:px-8 py-6 w-full flex flex-col min-h-0">
        {!selectedDistrict && (
          <DistrictMap
            districts={districts}
            districtStats={districtStats}
            onSelect={setSelectedDistrict}
          />
        )}

        {selectedDistrict && !selectedStation && (
          <StationList
            district={selectedDistrict}
            stations={stationsInDistrict}
            query={query}
            onQuery={setQuery}
            onSelect={setSelectedStation}
          />
        )}

        {selectedStation && station && <StationDetail station={station} />}
      </main>
      </div>
    </div>
  );
}

/* ---------------- 1단계: 서울시 지도 ---------------- */
function DistrictMap({
  districts,
  districtStats,
  onSelect,
}: {
  districts: District[];
  districtStats: Map<string, number>;
  onSelect: (name: string) => void;
}) {
  return (
    <section className="flex-1 flex flex-col min-h-0">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">서울시 자치구 지도</h2>
        <p className="text-sm text-muted-foreground mt-1">
          지역구를 선택하면 해당 구의 대여소 목록을 볼 수 있습니다
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 flex-1 flex flex-col min-h-0">
        <div className="relative flex-1 min-h-[500px] w-full rounded-xl bg-[oklch(0.97_0.01_220)] border border-border overflow-hidden">
          {/* 한강 (row 4.5 부근) */}
          <div
            className="absolute inset-x-0 bg-[oklch(0.82_0.06_220)]/70"
            style={{
              top: `${(4.4 / 7) * 100}%`,
              height: `${(0.5 / 7) * 100}%`,
            }}
          />
          <div
            className="absolute text-[10px] font-medium text-[oklch(0.45_0.1_220)]"
            style={{ left: "2%", top: `${(4.5 / 7) * 100}%` }}
          >
            한강
          </div>

          {/* 8x7 그리드 위에 자치구 배치 */}
          {districts.map((d) => {
            const count = districtStats.get(d.name) ?? 0;
            return (
              <button
                key={d.code}
                onClick={() => onSelect(d.name)}
                className="absolute group flex flex-col items-center justify-center rounded-lg border border-border bg-card hover:bg-primary-soft hover:border-primary/50 hover:z-10 hover:scale-[1.08] transition-all shadow-sm"
                style={{
                  left: `${((d.col - 0.5) / 8) * 100}%`,
                  top: `${((d.row - 0.5) / 7) * 100}%`,
                  width: `${(1 / 8) * 100}%`,
                  height: `${(1 / 7) * 100}%`,
                  padding: 4,
                }}
              >
                <span className="text-sm font-semibold leading-none group-hover:text-primary">
                  {d.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1 group-hover:text-primary/80">
                  {count}개소
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded bg-card border border-border" /> 자치구
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded bg-[oklch(0.82_0.06_220)]/70" /> 한강
          </span>
          <span className="ml-auto">총 {allStations.length}개 대여소</span>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 2단계: 구 내 대여소 목록 ---------------- */
function StationList({
  district,
  stations,
  query,
  onQuery,
  onSelect,
}: {
  district: string;
  stations: Station[];
  query: string;
  onQuery: (v: string) => void;
  onSelect: (id: string) => void;
}) {
  const filtered = stations.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">{district} 대여소</h2>
          <p className="text-sm text-muted-foreground mt-1">
            총 {stations.length}개 · 대여소를 클릭하면 상세 현황을 볼 수 있습니다
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="대여소 이름 검색..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="bg-card border border-border rounded-2xl p-5 text-left hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="size-10 rounded-xl bg-primary-soft flex items-center justify-center">
                <MapPin className="size-5 text-primary" />
              </div>
              <StatusBadge status={s.status} />
            </div>
            <div className="mt-4 font-semibold leading-tight">{s.name}</div>
            <div className="text-xs text-muted-foreground mt-1">대여소 #{s.id}</div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold tabular-nums">
                  {s.availableBikes}
                  <span className="text-sm text-muted-foreground font-normal">
                    {" "}
                    / {s.totalSlots}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">대여 가능</div>
              </div>
              <div className="text-xs text-muted-foreground">{s.lastUpdate}</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- 3단계: 대여소 상세 ---------------- */
function StationDetail({ station }: { station: Station }) {
  const ratio = station.availableBikes / station.totalSlots;
  const statusText: Record<StationStatus, string> = {
    available: "여유",
    normal: "보통",
    shortage: "부족",
    maintenance: "점검 중",
  };

  return (
    <section>
      <div className="mb-5">
        <div className="text-sm text-muted-foreground">{station.district}</div>
        <h2 className="text-2xl font-bold mt-1">{station.name}</h2>
        <div className="text-xs text-muted-foreground mt-1">
          대여소 ID #{station.id} · 마지막 업데이트 {station.lastUpdate}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="text-sm font-medium text-muted-foreground">실시간 보유 자전거</div>
            <StatusBadge status={station.status} />
          </div>
          <div className="flex items-end gap-3">
            <div className="text-5xl font-bold tabular-nums">
              {station.availableBikes}
            </div>
            <div className="text-base text-muted-foreground mb-2">
              / {station.totalSlots} 거치대
            </div>
          </div>
          <div className="mt-5 h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                station.status === "shortage"
                  ? "bg-[oklch(0.62_0.22_15)]"
                  : station.status === "available"
                    ? "bg-[oklch(0.7_0.16_155)]"
                    : station.status === "maintenance"
                      ? "bg-muted-foreground/40"
                      : "bg-[oklch(0.78_0.15_70)]"
              }`}
              style={{ width: `${Math.max(4, ratio * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            가동률 {Math.round(ratio * 100)}% · 상태: {statusText[station.status]}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <DetailRow
            icon={<Battery className="size-4" />}
            label="평균 배터리"
            value={`${station.battery}%`}
          />
          <DetailRow
            icon={<MapPin className="size-4" />}
            label="위치"
            value={station.district}
          />
          <DetailRow
            icon={
              station.status === "maintenance" ? (
                <Wrench className="size-4" />
              ) : station.status === "shortage" ? (
                <AlertTriangle className="size-4" />
              ) : (
                <CheckCircle2 className="size-4" />
              )
            }
            label="운영 상태"
            value={statusText[station.status]}
          />
          <DetailRow
            icon={<Bike className="size-4" />}
            label="총 거치대"
            value={`${station.totalSlots}개`}
          />
        </div>
      </div>
    </section>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: StationStatus }) {
  const map: Record<StationStatus, { label: string; cls: string }> = {
    available: {
      label: "여유",
      cls: "bg-success-soft text-[oklch(0.45_0.15_155)]",
    },
    normal: {
      label: "보통",
      cls: "bg-warning-soft text-[oklch(0.5_0.15_70)]",
    },
    shortage: {
      label: "부족",
      cls: "bg-danger-soft text-[oklch(0.55_0.22_15)]",
    },
    maintenance: {
      label: "점검 중",
      cls: "bg-muted text-muted-foreground",
    },
  };
  const item = map[status];
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${item.cls}`}>
      {item.label}
    </span>
  );
}
