"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_MUNICIPALITY_METRICS } from "@/lib/data/demo-analytics";
import {
  mapStatusColor,
  mapStatusTone,
  projectToMap,
} from "@/lib/domain/analytics";
import { formatCurrency } from "@/features/management/utils";
import {
  MAP_STATUS_LABELS,
  type MapStatus,
  type MunicipalityMetric,
} from "@/types/analytics";
import type { MunicipalityRegion } from "@/lib/data/municipalities";

const WIDTH = 640;
const HEIGHT = 520;

export function MapClient() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>("Todas");
  const [status, setStatus] = useState<string>("todos");
  const [selected, setSelected] = useState<MunicipalityMetric | null>(
    DEMO_MUNICIPALITY_METRICS.find((m) => m.name === "Campo Grande") ?? null,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_MUNICIPALITY_METRICS.filter((item) => {
      const matchesQuery = !q || item.name.toLowerCase().includes(q);
      const matchesRegion = region === "Todas" || item.region === region;
      const matchesStatus = status === "todos" || item.status === status;
      return matchesQuery && matchesRegion && matchesStatus;
    });
  }, [query, region, status]);

  const summary = useMemo(() => {
    const counts = {
      em_andamento: 0,
      em_atencao: 0,
      atrasado: 0,
      concluido: 0,
      sem_projeto: 0,
    } satisfies Record<MapStatus, number>;
    for (const item of DEMO_MUNICIPALITY_METRICS) {
      counts[item.status] += 1;
    }
    return counts;
  }, []);

  return (
    <div>
      <PageHeader
        title="Mapa estadual"
        breadcrumbs={[
          { label: "Gestão territorial", href: "/mapa" },
          { label: "Mapa estadual" },
        ]}
      />

      <div className="mb-4 grid gap-3 md:grid-cols-5">
        {(Object.keys(MAP_STATUS_LABELS) as MapStatus[]).map((key) => (
          <Card key={key}>
            <CardContent className="flex items-center justify-between pt-4 pb-4">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="size-3 rounded-full"
                  style={{ background: mapStatusColor(key) }}
                  aria-hidden
                />
                {MAP_STATUS_LABELS[key]}
              </div>
              <span className="font-semibold">{summary[key]}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 pt-6 md:flex-row">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar município..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select
            value={region}
            onValueChange={(value) => setRegion(value ?? "Todas")}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                ["Todas", "Centro", "Norte", "Sul", "Leste", "Pantanal"] as const
              ).map((item) => (
                <SelectItem key={item} value={item}>
                  {item === "Todas" ? "Todas as regiões" : item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value ?? "todos")}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {(Object.keys(MAP_STATUS_LABELS) as MapStatus[]).map((item) => (
                <SelectItem key={item} value={item}>
                  {MAP_STATUS_LABELS[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Distribuição territorial — MS ({filtered.length} municípios)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="mx-auto h-auto w-full max-w-3xl rounded-lg border border-border bg-[#eef1f8]"
                role="img"
                aria-label="Mapa esquemático dos municípios de Mato Grosso do Sul"
              >
                <rect
                  x="12"
                  y="12"
                  width={WIDTH - 24}
                  height={HEIGHT - 24}
                  rx="16"
                  fill="#e8ecf7"
                  stroke="#c5cce0"
                />
                <text
                  x={WIDTH / 2}
                  y={36}
                  textAnchor="middle"
                  className="fill-[#1b2030]"
                  fontSize="14"
                  fontWeight="600"
                >
                  Mato Grosso do Sul
                </text>
                {filtered.map((item) => {
                  const { x, y } = projectToMap(
                    item.latitude,
                    item.longitude,
                    WIDTH,
                    HEIGHT,
                  );
                  const active = selected?.municipalityId === item.municipalityId;
                  return (
                    <g key={item.municipalityId}>
                      <circle
                        cx={x}
                        cy={y}
                        r={active ? 8 : item.projects > 0 ? 5.5 : 3.5}
                        fill={mapStatusColor(item.status)}
                        stroke={active ? "#1b2030" : "#fff"}
                        strokeWidth={active ? 2 : 1}
                        className="cursor-pointer"
                        onClick={() => setSelected(item)}
                      >
                        <title>
                          {item.name} — {MAP_STATUS_LABELS[item.status]}
                        </title>
                      </circle>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhe municipal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold">{selected.name}</p>
                    <p className="text-muted-foreground">
                      Região {selected.region as MunicipalityRegion}
                    </p>
                  </div>
                  <StatusBadge
                    label={MAP_STATUS_LABELS[selected.status]}
                    tone={mapStatusTone(selected.status)}
                  />
                </div>
                <p>
                  <strong>Projetos:</strong> {selected.projects}
                </p>
                <p>
                  <strong>Entregas:</strong> {selected.deliverables}
                </p>
                <p>
                  <strong>Execução:</strong> {selected.executionPercent}%
                </p>
                <p>
                  <strong>Investimento:</strong>{" "}
                  {formatCurrency(selected.investment)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Coordenadas {selected.latitude.toFixed(4)},{" "}
                  {selected.longitude.toFixed(4)}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                Selecione um município no mapa.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
