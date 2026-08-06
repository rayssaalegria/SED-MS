"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { FeatureCollection } from "geojson";
import { PageHeader } from "@/components/layout/page-header";
import {
  FilterToolbar,
  ResultCount,
  SearchField,
  filterFieldClass,
} from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEMO_MUNICIPALITY_METRICS } from "@/lib/data/demo-analytics";
import { mapStatusColor, mapStatusTone } from "@/lib/domain/analytics";
import { formatCurrency } from "@/features/management/utils";
import {
  MAP_STATUS_LABELS,
  type MapStatus,
  type MunicipalityMetric,
} from "@/types/analytics";
import type { MunicipalityRegion } from "@/lib/data/municipalities";
import { cn } from "@/lib/utils";

const MsInteractiveMap = dynamic(
  () =>
    import("@/features/map/components/ms-interactive-map").then(
      (mod) => mod.MsInteractiveMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(70vh,640px)] items-center justify-center rounded-lg border border-border bg-[#eef1f8] text-sm text-muted-foreground">
        Carregando mapa interativo de Mato Grosso do Sul…
      </div>
    ),
  },
);

export function MapClient() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string>("Todas");
  const [status, setStatus] = useState<string>("todos");
  const [selected, setSelected] = useState<MunicipalityMetric | null>(
    DEMO_MUNICIPALITY_METRICS.find((m) => m.name === "Campo Grande") ?? null,
  );
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/geo/ms-municipios.geojson")
      .then((response) => {
        if (!response.ok) throw new Error("Falha ao carregar malha municipal.");
        return response.json();
      })
      .then((data: FeatureCollection) => {
        if (!cancelled) setGeojson(data);
      })
      .catch(() => {
        if (!cancelled) {
          setGeoError("Não foi possível carregar o mapa geográfico.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_MUNICIPALITY_METRICS.filter((item) => {
      const matchesQuery = !q || item.name.toLowerCase().includes(q);
      const matchesRegion = region === "Todas" || item.region === region;
      const matchesStatus = status === "todos" || item.status === status;
      return matchesQuery && matchesRegion && matchesStatus;
    });
  }, [query, region, status]);

  const filteredIds = useMemo(
    () => new Set(filtered.map((item) => item.municipalityId)),
    [filtered],
  );

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

  useEffect(() => {
    if (selected && !filteredIds.has(selected.municipalityId)) {
      setSelected(filtered[0] ?? null);
    }
  }, [filtered, filteredIds, selected]);

  return (
    <div>
      <PageHeader
        title="Mapa da rede educacional"
        description="Mapa interativo dos 79 municípios de Mato Grosso do Sul — clique, filtre e acompanhe a execução da SED."
        breadcrumbs={[
          { label: "Gestão territorial", href: "/mapa" },
          { label: "Mapa da rede" },
        ]}
      />

      <FilterToolbar
        trailing={
          <ResultCount
            filtered={filtered.length}
            total={DEMO_MUNICIPALITY_METRICS.length}
            label="município"
          />
        }
      >
        <SearchField
          placeholder="Buscar município..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar município"
        />
        <Select
          value={region}
          onValueChange={(value) => setRegion(value ?? "Todas")}
        >
          <SelectTrigger
            className={cn(filterFieldClass, "w-[180px]")}
            aria-label="Filtrar por região"
          >
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
          <SelectTrigger
            className={cn(filterFieldClass, "w-[180px]")}
            aria-label="Filtrar por status"
          >
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
      </FilterToolbar>

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

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Mapa interativo — MS ({filtered.length} municípios)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {geoError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {geoError}
              </p>
            ) : !geojson ? (
              <div className="flex h-[min(70vh,640px)] items-center justify-center rounded-lg border border-border bg-[#eef1f8] text-sm text-muted-foreground">
                Carregando malha municipal…
              </div>
            ) : (
              <MsInteractiveMap
                municipalities={DEMO_MUNICIPALITY_METRICS}
                filteredIds={filteredIds}
                selectedId={selected?.municipalityId ?? null}
                onSelect={setSelected}
                geojson={geojson}
              />
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Use o zoom e o arraste para navegar. Passe o mouse para ver o
              resumo e clique no município para abrir o detalhe.
            </p>
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
