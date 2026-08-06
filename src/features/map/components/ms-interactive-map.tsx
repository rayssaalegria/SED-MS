"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ZoomControl,
  useMap,
} from "react-leaflet";
import type {
  Feature,
  FeatureCollection,
  Geometry,
  GeoJsonObject,
} from "geojson";
import type { Path, PathOptions } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mapStatusColor, MS_BOUNDS } from "@/lib/domain/analytics";
import { MAP_STATUS_LABELS, type MunicipalityMetric } from "@/types/analytics";

type MsFeatureProperties = {
  codarea?: string;
};

type MsFeature = Feature<Geometry, MsFeatureProperties>;

interface MsInteractiveMapProps {
  municipalities: MunicipalityMetric[];
  filteredIds: Set<string>;
  selectedId: string | null;
  onSelect: (item: MunicipalityMetric) => void;
  geojson: FeatureCollection;
}

function FitMsBounds({ geojson }: { geojson: FeatureCollection }) {
  const map = useMap();
  useEffect(() => {
    try {
      const layer = L.geoJSON(geojson as GeoJsonObject);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [24, 24], maxZoom: 8 });
      }
    } catch {
      map.setView(
        [
          (MS_BOUNDS.minLat + MS_BOUNDS.maxLat) / 2,
          (MS_BOUNDS.minLng + MS_BOUNDS.maxLng) / 2,
        ],
        6,
      );
    }
  }, [geojson, map]);
  return null;
}

function FlyToSelection({
  selected,
}: {
  selected: MunicipalityMetric | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!selected) return;
    map.flyTo(
      [selected.latitude, selected.longitude],
      Math.max(map.getZoom(), 8),
      { duration: 0.6 },
    );
  }, [selected, map]);
  return null;
}

function pathStyle(
  metric: MunicipalityMetric | undefined,
  isFiltered: boolean,
  isSelected: boolean,
): PathOptions {
  const status = metric?.status ?? "sem_projeto";
  const fill = mapStatusColor(status);
  return {
    fillColor: fill,
    fillOpacity: isFiltered ? (isSelected ? 0.92 : 0.78) : 0.12,
    color: isSelected ? "#1b2030" : isFiltered ? "#ffffff" : "#cbd5e1",
    weight: isSelected ? 2.5 : 1,
    opacity: isFiltered ? 1 : 0.35,
  };
}

export function MsInteractiveMap({
  municipalities,
  filteredIds,
  selectedId,
  onSelect,
  geojson,
}: MsInteractiveMapProps) {
  const byIbge = useMemo(() => {
    const map = new Map<string, MunicipalityMetric>();
    for (const item of municipalities) {
      map.set(item.municipalityId.replace(/^mun-/, ""), item);
    }
    return map;
  }, [municipalities]);

  const selected = useMemo(
    () => municipalities.find((m) => m.municipalityId === selectedId) ?? null,
    [municipalities, selectedId],
  );

  const layerByCode = useRef(new Map<string, Path>());

  useEffect(() => {
    layerByCode.current.forEach((layer, code) => {
      const metric = byIbge.get(code);
      const municipalityId = metric?.municipalityId ?? `mun-${code}`;
      layer.setStyle(
        pathStyle(
          metric,
          filteredIds.has(municipalityId),
          municipalityId === selectedId,
        ),
      );
      if (municipalityId === selectedId) {
        layer.bringToFront();
      }
    });
  }, [byIbge, filteredIds, selectedId]);

  return (
    <div className="relative h-[min(70vh,640px)] w-full overflow-hidden rounded-lg border border-border">
      <MapContainer
        center={[-20.5, -54.5]}
        zoom={6}
        className="z-0 h-full w-full"
        zoomControl={false}
        scrollWheelZoom
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitMsBounds geojson={geojson} />
        <FlyToSelection selected={selected} />
        <GeoJSON
          data={geojson as GeoJsonObject}
          style={(feature) => {
            const code = String(
              (feature as MsFeature | undefined)?.properties?.codarea ?? "",
            );
            const metric = byIbge.get(code);
            const municipalityId = metric?.municipalityId ?? `mun-${code}`;
            return pathStyle(
              metric,
              filteredIds.has(municipalityId),
              municipalityId === selectedId,
            );
          }}
          onEachFeature={(feature, layer) => {
            const code = String(
              (feature as MsFeature).properties?.codarea ?? "",
            );
            const metric = byIbge.get(code);
            if (!metric) return;

            layerByCode.current.set(code, layer as Path);
            const path = layer as Path;

            path.bindTooltip(
              `<strong>${metric.name}</strong><br/>${MAP_STATUS_LABELS[metric.status]} · ${metric.executionPercent}%`,
              { sticky: true, opacity: 0.95 },
            );

            path.on({
              mouseover: (event) => {
                const target = event.target as Path;
                target.setStyle({ weight: 2.5, fillOpacity: 0.95 });
                target.bringToFront();
              },
              mouseout: (event) => {
                const target = event.target as Path;
                target.setStyle(
                  pathStyle(
                    metric,
                    filteredIds.has(metric.municipalityId),
                    metric.municipalityId === selectedId,
                  ),
                );
              },
              click: () => onSelect(metric),
            });
          }}
        />
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-md bg-white/95 px-3 py-2 text-xs shadow-sm ring-1 ring-border">
        <p className="mb-1 font-medium text-[#1b2030]">Legenda</p>
        <ul className="space-y-1">
          {(
            Object.keys(MAP_STATUS_LABELS) as Array<
              keyof typeof MAP_STATUS_LABELS
            >
          ).map((key) => (
            <li key={key} className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: mapStatusColor(key) }}
              />
              {MAP_STATUS_LABELS[key]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
