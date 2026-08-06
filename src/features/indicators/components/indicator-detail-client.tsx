"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMonitoring } from "@/features/monitoring/store";
import { indicatorTone } from "@/features/monitoring/utils";
import {
  calcAchievementPercent,
  resolveIndicatorStatus,
  resolveTrend,
} from "@/lib/domain/monitoring";
import { INDICATOR_STATUS_LABELS } from "@/types/monitoring";

export function IndicatorDetailClient({ id }: { id: string }) {
  const { indicators, indicatorResults, addIndicatorResult } = useMonitoring();
  const [value, setValue] = useState("");
  const [period, setPeriod] = useState("2026-08");

  const indicator = indicators.find((item) => item.id === id);

  const history = useMemo(
    () =>
      indicatorResults
        .filter((item) => item.indicatorId === id)
        .sort((a, b) => a.period.localeCompare(b.period)),
    [id, indicatorResults],
  );

  if (!indicator) notFound();
  const current = indicator;

  const status = resolveIndicatorStatus(current);
  const percent = calcAchievementPercent(
    current.currentResult,
    current.annualTarget,
    current.polarity,
  );
  const trend = resolveTrend(
    current.currentResult,
    current.previousResult,
    current.polarity,
  );
  const TrendIcon =
    trend === "alta" ? ArrowUpRight : trend === "baixa" ? ArrowDownRight : Minus;

  function handleAddResult() {
    const numeric = Number(value);
    if (!period || Number.isNaN(numeric)) {
      toast.error("Informe período e resultado válidos.");
      return;
    }
    addIndicatorResult({
      id: crypto.randomUUID(),
      indicatorId: current.id,
      period,
      value: numeric,
      target: current.annualTarget,
      recordedAt: new Date().toISOString().slice(0, 10),
      recordedBy: current.ownerName,
    });
    setValue("");
    toast.success("Resultado registrado na série histórica.");
  }

  const chartData = history.map((item) => ({
    period: item.period,
    resultado: item.value,
    meta: item.target,
  }));

  return (
    <div>
      <PageHeader
        title={current.name}
        breadcrumbs={[
          { label: "Indicadores", href: "/indicadores" },
          { label: current.code },
        ]}
        actions={
          <StatusBadge
            label={INDICATOR_STATUS_LABELS[status]}
            tone={indicatorTone(status)}
          />
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Resultado atual"
          value={`${current.currentResult} ${current.unitOfMeasure}`}
        />
        <MetricCard
          title="Resultado anterior"
          value={`${current.previousResult} ${current.unitOfMeasure}`}
        />
        <MetricCard title="Atingimento" value={`${percent}%`} />
        <MetricCard
          title="Tendência"
          value={
            trend === "alta" ? "Em alta" : trend === "baixa" ? "Em baixa" : "Estável"
          }
          description={`${current.previousResult} → ${current.currentResult}`}
          icon={TrendIcon}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Evolução e linha de meta</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem série histórica para este indicador.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="resultado"
                    name="Resultado"
                    stroke="#1b2030"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="meta"
                    name="Meta"
                    stroke="#7d141d"
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registrar resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Input
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="2026-08"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Resultado</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <Button type="button" onClick={handleAddResult}>
              Salvar resultado
            </Button>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <p className="inline-flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4" aria-hidden />
                {INDICATOR_STATUS_LABELS[status]}
              </p>
              <p className="mt-1 text-muted-foreground">
                Status automático com texto e ícone (não apenas cor).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ficha do indicador</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p>
            <strong>Código:</strong> {current.code}
          </p>
          <p>
            <strong>Periodicidade:</strong> {current.periodicity}
          </p>
          <p>
            <strong>Fórmula:</strong> {current.formula}
          </p>
          <p>
            <strong>Fonte:</strong> {current.dataSource}
          </p>
          <p>
            <strong>Responsável alimentação:</strong> {current.ownerName}
          </p>
          <p>
            <strong>Responsável validação:</strong> {current.validatorName}
          </p>
          <p>
            <strong>Linha de base:</strong> {current.baseline} (
            {current.baselineYear})
          </p>
          <p>
            <strong>Última atualização:</strong> {current.updatedAt}
          </p>
        </CardContent>
      </Card>

      <div className="mt-4">
        <Button variant="outline" render={<Link href="/indicadores" />}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
