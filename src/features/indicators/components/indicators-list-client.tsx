"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Minus,
  Search,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMonitoring } from "@/features/monitoring/store";
import { indicatorTone } from "@/features/monitoring/utils";
import {
  calcAchievementPercent,
  resolveIndicatorStatus,
  resolveTrend,
} from "@/lib/domain/monitoring";
import { INDICATOR_STATUS_LABELS } from "@/types/monitoring";

export function IndicatorsListClient() {
  const { indicators } = useMonitoring();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return indicators;
    return indicators.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.ownerName.toLowerCase().includes(q),
    );
  }, [indicators, query]);

  return (
    <div>
      <PageHeader
        title="Indicadores"
        breadcrumbs={[
          { label: "Gestão estratégica", href: "/indicadores" },
          { label: "Indicadores" },
        ]}
      />

      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar indicador..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Indicador</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Atingimento</TableHead>
                <TableHead>Tendência</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((indicator) => {
                const status = resolveIndicatorStatus(indicator);
                const percent = calcAchievementPercent(
                  indicator.currentResult,
                  indicator.annualTarget,
                  indicator.polarity,
                );
                const trend = resolveTrend(
                  indicator.currentResult,
                  indicator.previousResult,
                  indicator.polarity,
                );
                const TrendIcon =
                  trend === "alta"
                    ? ArrowUpRight
                    : trend === "baixa"
                      ? ArrowDownRight
                      : Minus;
                return (
                  <TableRow key={indicator.id}>
                    <TableCell>
                      <Link
                        href={`/indicadores/${indicator.id}`}
                        className="font-medium text-[#7d141d] hover:underline"
                      >
                        {indicator.code}
                      </Link>
                    </TableCell>
                    <TableCell>{indicator.name}</TableCell>
                    <TableCell>
                      {indicator.currentResult} {indicator.unitOfMeasure}
                    </TableCell>
                    <TableCell>
                      {indicator.annualTarget} {indicator.unitOfMeasure}
                    </TableCell>
                    <TableCell>{percent}%</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <TrendIcon className="size-4" aria-hidden />
                        {trend === "alta"
                          ? "Em alta"
                          : trend === "baixa"
                            ? "Em baixa"
                            : "Estável"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={INDICATOR_STATUS_LABELS[status]}
                        tone={indicatorTone(status)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
