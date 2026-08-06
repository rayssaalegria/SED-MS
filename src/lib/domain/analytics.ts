import type { MapStatus } from "@/types/analytics";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export function mapStatusTone(status: MapStatus): Tone {
  if (status === "concluido") return "success";
  if (status === "atrasado") return "danger";
  if (status === "em_atencao") return "warning";
  if (status === "em_andamento") return "info";
  return "neutral";
}

export function mapStatusColor(status: MapStatus) {
  if (status === "concluido") return "#15803d";
  if (status === "atrasado") return "#b91c1c";
  if (status === "em_atencao") return "#ca8a04";
  if (status === "em_andamento") return "#1d4ed8";
  return "#94a3b8";
}

/** Bounding box aproximado de Mato Grosso do Sul. */
export const MS_BOUNDS = {
  minLat: -24.2,
  maxLat: -17.2,
  minLng: -58.3,
  maxLng: -50.9,
};

export function projectToMap(
  latitude: number,
  longitude: number,
  width: number,
  height: number,
  pad = 24,
) {
  const x =
    pad +
    ((longitude - MS_BOUNDS.minLng) /
      (MS_BOUNDS.maxLng - MS_BOUNDS.minLng)) *
      (width - pad * 2);
  const y =
    pad +
    ((MS_BOUNDS.maxLat - latitude) /
      (MS_BOUNDS.maxLat - MS_BOUNDS.minLat)) *
      (height - pad * 2);
  return { x, y };
}

export function escapeCsvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  if (/[",\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function rowsToCsv(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
) {
  const lines = [
    headers.map(escapeCsvCell).join(";"),
    ...rows.map((row) => row.map(escapeCsvCell).join(";")),
  ];
  return `\uFEFF${lines.join("\n")}`;
}

export function downloadCsv(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
