import type { BudgetForecast, ProjectBudgetType } from "@/types/budget";

const HEADER_ALIASES: Record<string, string[]> = {
  projectName: [
    "projeto",
    "nome do projeto",
    "nome_projeto",
    "project",
    "project_name",
    "nome",
  ],
  projectType: [
    "tipo",
    "tipo de projeto",
    "tipo_projeto",
    "project_type",
    "categoria",
  ],
  description: ["descricao", "descrição", "description", "detalhe", "detalhes"],
  plannedValue: [
    "valor",
    "valor previsto",
    "valor_previsto",
    "previsto",
    "orcamento",
    "orçamento",
    "planned",
    "planned_value",
  ],
  forecastDate: [
    "data",
    "data da previsao",
    "data da previsão",
    "data_previsao",
    "forecast_date",
    "created_at",
  ],
  observations: ["observacoes", "observações", "obs", "notes", "observation"],
  code: ["codigo", "código", "code"],
};

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (raw == null) return null;
  const text = String(raw).trim();
  if (!text) return null;
  const normalized = text
    .replace(/R\$\s?/gi, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function parseDate(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") {
    // Excel serial date (approx)
    const date = new Date(Math.round((raw - 25569) * 86400 * 1000));
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const text = String(raw).trim();
  const br = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const iso = Date.parse(text);
  if (!Number.isNaN(iso)) return new Date(iso).toISOString().slice(0, 10);
  return null;
}

function mapProjectType(raw: unknown): ProjectBudgetType {
  const text = normalizeHeader(String(raw ?? ""));
  if (text.includes("infra")) return "infraestrutura";
  if (text.includes("tecno") || text.includes("conect")) return "tecnologia";
  if (text.includes("pedag")) return "pedagogico";
  if (text.includes("form")) return "formacao";
  if (text.includes("inclu") || text.includes("indigen")) return "inclusao";
  return "outro";
}

export interface ImportColumnMapping {
  field: string;
  header: string | null;
  identified: boolean;
}

export interface ImportedBudgetRow {
  projectName: string;
  projectType: ProjectBudgetType;
  description: string;
  plannedValue: number;
  forecastDate: string;
  observations: string;
  code: string;
}

export interface BudgetImportResult {
  mappings: ImportColumnMapping[];
  unidentifiedHeaders: string[];
  rows: ImportedBudgetRow[];
  errors: string[];
}

function mapHeaders(headers: string[]) {
  const normalized = headers.map((h) => ({
    original: h,
    key: normalizeHeader(h),
  }));
  const mappings: ImportColumnMapping[] = [];
  const used = new Set<string>();

  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const match = normalized.find(
      (h) => !used.has(h.original) && aliases.includes(h.key),
    );
    if (match) {
      used.add(match.original);
      mappings.push({ field, header: match.original, identified: true });
    } else {
      mappings.push({ field, header: null, identified: false });
    }
  }

  const unidentifiedHeaders = normalized
    .filter((h) => !used.has(h.original) && h.key)
    .map((h) => h.original);

  return { mappings, unidentifiedHeaders };
}

function cell(
  row: Record<string, unknown>,
  mappings: ImportColumnMapping[],
  field: string,
) {
  const mapping = mappings.find((m) => m.field === field);
  if (!mapping?.header) return undefined;
  return row[mapping.header];
}

export function parseBudgetMatrix(
  headers: string[],
  matrix: unknown[][],
): BudgetImportResult {
  const { mappings, unidentifiedHeaders } = mapHeaders(headers);
  const errors: string[] = [];
  const requiredMissing = mappings
    .filter(
      (m) =>
        !m.identified &&
        ["projectName", "plannedValue", "forecastDate"].includes(m.field),
    )
    .map((m) => m.field);

  if (requiredMissing.length > 0) {
    errors.push(
      `Colunas obrigatórias não identificadas: ${requiredMissing.join(", ")}.`,
    );
  }

  const rows: ImportedBudgetRow[] = [];
  matrix.forEach((rawRow, index) => {
    const row: Record<string, unknown> = {};
    headers.forEach((header, col) => {
      row[header] = rawRow[col];
    });

    const projectName = String(
      cell(row, mappings, "projectName") ?? "",
    ).trim();
    const plannedValue = parseNumber(cell(row, mappings, "plannedValue"));
    const forecastDate =
      parseDate(cell(row, mappings, "forecastDate")) ??
      new Date().toISOString().slice(0, 10);

    if (!projectName && plannedValue == null) return;

    if (!projectName || plannedValue == null) {
      errors.push(`Linha ${index + 2}: nome do projeto ou valor inválido.`);
      return;
    }

    rows.push({
      projectName,
      projectType: mapProjectType(cell(row, mappings, "projectType")),
      description: String(cell(row, mappings, "description") ?? "").trim(),
      plannedValue,
      forecastDate,
      observations: String(cell(row, mappings, "observations") ?? "").trim(),
      code: String(cell(row, mappings, "code") ?? "").trim(),
    });
  });

  return { mappings, unidentifiedHeaders, rows, errors };
}

export function parseCsvText(content: string): BudgetImportResult {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    return {
      mappings: [],
      unidentifiedHeaders: [],
      rows: [],
      errors: ["Arquivo CSV vazio ou sem dados."],
    };
  }

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const split = (line: string) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === delimiter && !inQuotes) {
        cells.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    cells.push(current.trim());
    return cells;
  };

  const headers = split(lines[0]);
  const matrix = lines.slice(1).map(split);
  return parseBudgetMatrix(headers, matrix);
}

export async function parseBudgetFile(file: File): Promise<BudgetImportResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || file.type.includes("csv")) {
    const text = await file.text();
    return parseCsvText(text);
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        mappings: [],
        unidentifiedHeaders: [],
        rows: [],
        errors: ["Planilha sem abas."],
      };
    }
    const sheet = workbook.Sheets[sheetName];
    const aoa = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
    });
    if (aoa.length < 2) {
      return {
        mappings: [],
        unidentifiedHeaders: [],
        rows: [],
        errors: ["Planilha vazia ou sem dados."],
      };
    }
    const headers = (aoa[0] ?? []).map((h) => String(h ?? "").trim());
    const matrix = aoa.slice(1);
    return parseBudgetMatrix(headers, matrix);
  }

  return {
    mappings: [],
    unidentifiedHeaders: [],
    rows: [],
    errors: ["Formato não suportado. Use CSV ou XLSX."],
  };
}

export function importedRowToForecast(
  row: ImportedBudgetRow,
  projectId: string,
  fileName: string,
): Omit<BudgetForecast, "id"> {
  return {
    code: row.code || `ORC-${Date.now().toString().slice(-6)}`,
    projectId,
    projectName: row.projectName,
    projectType: row.projectType,
    description: row.description || `Previsão importada de ${fileName}`,
    plannedValue: row.plannedValue,
    forecastDate: row.forecastDate,
    createdAt: new Date().toISOString().slice(0, 10),
    source: "arquivo",
    sourceFileName: fileName,
    status: "em_analise",
    observations: row.observations || undefined,
  };
}
