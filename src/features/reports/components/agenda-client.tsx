"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
  Table2,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  FilterToolbar,
  filterFieldClass,
} from "@/components/shared/filter-toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEMO_AGENDA_EVENTS } from "@/lib/data/demo-analytics";
import { cn } from "@/lib/utils";
import {
  AGENDA_TYPE_LABELS,
  type AgendaEvent,
  type AgendaEventType,
} from "@/types/analytics";

const GOOGLE_CALENDAR_KEY = "sed-ms-google-calendar-connected";
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function agendaTone(status: string) {
  if (status === "concluido") return "success" as const;
  if (status === "cancelado") return "danger" as const;
  return "info" as const;
}

function statusLabel(status: AgendaEvent["status"]) {
  if (status === "agendado") return "Agendado";
  if (status === "concluido") return "Concluído";
  return "Cancelado";
}

function parseMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return { year, month };
}

function formatMonthLabel(value: string) {
  const { year, month } = parseMonth(value);
  const label = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDayLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function shiftMonth(value: string, delta: number) {
  const { year, month } = parseMonth(value);
  const next = new Date(year, month - 1 + delta, 1);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function buildCalendarCells(month: string) {
  const { year, month: monthNumber } = parseMonth(month);
  const firstDay = new Date(year, monthNumber - 1, 1);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const startWeekday = firstDay.getDay();
  const cells: Array<{ date: string | null; day: number | null }> = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ date: null, day: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    cells.push({ date, day });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null });
  }

  return cells;
}

function eventTypeClass(type: AgendaEventType) {
  switch (type) {
    case "prazo":
      return "bg-[#7d141d]/10 text-[#7d141d] ring-[#7d141d]/20";
    case "reuniao":
      return "bg-[#1b2030]/10 text-[#1b2030] ring-[#1b2030]/15";
    case "avaliacao":
      return "bg-[#1d4ed8]/10 text-[#1d4ed8] ring-[#1d4ed8]/20";
    case "entrega":
      return "bg-[#15803d]/10 text-[#15803d] ring-[#15803d]/20";
    case "comitê":
      return "bg-[#7c3aed]/10 text-[#7c3aed] ring-[#7c3aed]/20";
    case "auditoria":
      return "bg-[#b45309]/10 text-[#b45309] ring-[#b45309]/20";
    default:
      return "bg-muted text-foreground ring-border";
  }
}

const emptyForm = {
  title: "",
  type: "reuniao" as AgendaEventType,
  date: new Date().toISOString().slice(0, 10),
  time: "09:00",
  organizationAcronym: "SED",
  location: "",
  relatedLabel: "",
};

type AgendaView = "tabela" | "calendario" | "agenda";

export function AgendaClient() {
  const [events, setEvents] = useState<AgendaEvent[]>(DEMO_AGENDA_EVENTS);
  const [type, setType] = useState<string>("todos");
  const [month, setMonth] = useState<string>("2026-08");
  const [view, setView] = useState<AgendaView>("calendario");
  const [selectedDate, setSelectedDate] = useState<string | null>("2026-08-06");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    setGoogleConnected(
      window.localStorage.getItem(GOOGLE_CALENDAR_KEY) === "true",
    );
  }, []);

  const filtered = useMemo(() => {
    return events
      .filter((item) => {
        const matchesType = type === "todos" || item.type === type;
        const matchesMonth = item.date.startsWith(month);
        return matchesType && matchesMonth;
      })
      .sort((a, b) => {
        const byDate = a.date.localeCompare(b.date);
        if (byDate !== 0) return byDate;
        return (a.time ?? "").localeCompare(b.time ?? "");
      });
  }, [events, month, type]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const item of filtered) {
      const list = map.get(item.date) ?? [];
      list.push(item);
      map.set(item.date, list);
    }
    return map;
  }, [filtered]);

  const calendarCells = useMemo(() => buildCalendarCells(month), [month]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDate.get(selectedDate) ?? [];
  }, [eventsByDate, selectedDate]);

  const agendaGroups = useMemo(() => {
    return Array.from(eventsByDate.entries()).map(([date, items]) => ({
      date,
      items,
    }));
  }, [eventsByDate]);

  function connectGoogleCalendar() {
    window.localStorage.setItem(GOOGLE_CALENDAR_KEY, "true");
    setGoogleConnected(true);
    toast.success("Google Calendar conectado.", {
      description: "Eventos novos poderão ser sincronizados nesta sessão.",
    });
  }

  function disconnectGoogleCalendar() {
    window.localStorage.removeItem(GOOGLE_CALENDAR_KEY);
    setGoogleConnected(false);
    toast.message("Google Calendar desconectado.");
  }

  function openCreateForDate(date?: string) {
    setForm({
      ...emptyForm,
      date: date ?? `${month}-01`,
    });
    setCreateOpen(true);
  }

  function handleCreate() {
    if (!form.title.trim() || !form.date || !form.location.trim()) {
      toast.error("Preencha título, data e local.");
      return;
    }

    const event: AgendaEvent = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      type: form.type,
      date: form.date,
      time: form.time || undefined,
      organizationAcronym: form.organizationAcronym || "SED",
      location: form.location.trim(),
      relatedLabel: form.relatedLabel.trim() || undefined,
      status: "agendado",
    };

    setEvents((prev) => [...prev, event]);
    setMonth(form.date.slice(0, 7));
    setSelectedDate(form.date);
    setCreateOpen(false);
    setForm(emptyForm);

    toast.success("Compromisso criado.", {
      description: googleConnected
        ? "Disponível para sincronização com o Google Calendar."
        : undefined,
    });
  }

  return (
    <div>
      <PageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {googleConnected ? (
              <Button
                type="button"
                variant="outline"
                onClick={disconnectGoogleCalendar}
              >
                <Check className="size-4" />
                Google Calendar conectado
                <Unlink className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={connectGoogleCalendar}
              >
                <CalendarDays className="size-4" />
                Conectar Google Calendar
              </Button>
            )}
            <Button
              type="button"
              onClick={() => openCreateForDate(selectedDate ?? undefined)}
            >
              <Plus className="size-4" />
              Nova agenda
            </Button>
          </div>
        }
      />

      {googleConnected && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--ms-success)]/25 bg-[var(--ms-success)]/5 px-3 py-2 text-sm text-[#1b2030]">
          <CalendarPlus className="size-4 text-[var(--ms-success)]" aria-hidden />
          Conta Google Calendar vinculada. Novos compromissos ficam prontos para
          sincronização.
        </div>
      )}

      <FilterToolbar
        trailing={
          <Tabs
            value={view}
            onValueChange={(value) =>
              setView((value as AgendaView) ?? "calendario")
            }
          >
            <TabsList>
              <TabsTrigger value="calendario">
                <CalendarDays data-icon="inline-start" />
                Calendário
              </TabsTrigger>
              <TabsTrigger value="agenda">
                <List data-icon="inline-start" />
                Agenda
              </TabsTrigger>
              <TabsTrigger value="tabela">
                <Table2 data-icon="inline-start" />
                Tabela
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Mês anterior"
            onClick={() => {
              setMonth((prev) => shiftMonth(prev, -1));
              setSelectedDate(null);
            }}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="min-w-[10rem] px-2 text-center text-sm font-semibold text-[#1b2030]">
            {formatMonthLabel(month)}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Próximo mês"
            onClick={() => {
              setMonth((prev) => shiftMonth(prev, 1));
              setSelectedDate(null);
            }}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <Select
          value={type}
          onValueChange={(value) => setType(value ?? "todos")}
        >
          <SelectTrigger
            className={cn(filterFieldClass, "w-[180px]")}
            aria-label="Filtrar por tipo"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {(Object.keys(AGENDA_TYPE_LABELS) as AgendaEventType[]).map(
              (item) => (
                <SelectItem key={item} value={item}>
                  {AGENDA_TYPE_LABELS[item]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </FilterToolbar>

      {view === "calendario" ? (
          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardContent className="pt-4">
                <div className="mb-2 grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="px-1 py-2 text-center text-xs font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarCells.map((cell, index) => {
                    if (!cell.date || cell.day === null) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="min-h-[92px] rounded-md bg-muted/20"
                        />
                      );
                    }

                    const dayEvents = eventsByDate.get(cell.date) ?? [];
                    const isSelected = selectedDate === cell.date;

                    return (
                      <button
                        key={cell.date}
                        type="button"
                        onClick={() => setSelectedDate(cell.date)}
                        className={cn(
                          "flex min-h-[92px] flex-col gap-1 rounded-md border p-1.5 text-left transition-colors",
                          "hover:border-[var(--ms-primary)]/40 hover:bg-[var(--ms-primary)]/[0.03]",
                          isSelected
                            ? "border-[var(--ms-primary)] bg-[var(--ms-primary)]/[0.05]"
                            : "border-border/70 bg-background",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                            isSelected
                              ? "bg-[#1b2030] text-white"
                              : "text-[#1b2030]",
                          )}
                        >
                          {cell.day}
                        </span>
                        <div className="flex flex-1 flex-col gap-1">
                          {dayEvents.slice(0, 2).map((item) => (
                            <span
                              key={item.id}
                              className={cn(
                                "truncate rounded px-1 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                                eventTypeClass(item.type),
                              )}
                              title={item.title}
                            >
                              {item.time ? `${item.time} · ` : ""}
                              {item.title}
                            </span>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{dayEvents.length - 2} mais
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1b2030]">
                      {selectedDate
                        ? formatDayLabel(selectedDate)
                        : "Selecione um dia"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedDate
                        ? `${selectedDayEvents.length} compromisso(s)`
                        : "Clique em uma data no calendário"}
                    </p>
                  </div>
                  {selectedDate && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openCreateForDate(selectedDate)}
                    >
                      <Plus className="size-3.5" />
                      Novo
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {selectedDayEvents.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-border/80 bg-muted/20 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-[#1b2030]">
                            {item.time ? `${item.time} · ` : ""}
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {AGENDA_TYPE_LABELS[item.type]} ·{" "}
                            {item.organizationAcronym} · {item.location}
                          </p>
                          {item.relatedLabel && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.relatedLabel}
                            </p>
                          )}
                        </div>
                        <StatusBadge
                          label={statusLabel(item.status)}
                          tone={agendaTone(item.status)}
                        />
                      </div>
                    </div>
                  ))}

                  {selectedDate && selectedDayEvents.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Nenhum compromisso neste dia.
                    </p>
                  )}

                  {!selectedDate && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Escolha um dia para ver a agenda.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
      ) : view === "agenda" ? (
          <Card>
            <CardContent className="space-y-6 pt-6">
              {agendaGroups.map((group) => (
                <section key={group.date} className="space-y-3">
                  <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-2">
                    <h3 className="text-sm font-semibold capitalize text-[#1b2030]">
                      {formatDayLabel(group.date)}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {group.items.length} item(ns)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 rounded-lg border border-border/80 p-3 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="flex gap-3">
                          <div className="w-14 shrink-0 text-sm font-semibold tabular-nums text-[#1b2030]">
                            {item.time ?? "—"}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {AGENDA_TYPE_LABELS[item.type]} ·{" "}
                              {item.organizationAcronym} · {item.location}
                            </p>
                            {item.relatedLabel && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {item.relatedLabel}
                              </p>
                            )}
                          </div>
                        </div>
                        <StatusBadge
                          label={statusLabel(item.status)}
                          tone={agendaTone(item.status)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {agendaGroups.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum compromisso no filtro selecionado.
                </p>
              )}
            </CardContent>
          </Card>
      ) : (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Órgão</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        {item.date}
                        {item.time ? ` · ${item.time}` : ""}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{item.title}</p>
                        {item.relatedLabel && (
                          <p className="text-xs text-muted-foreground">
                            {item.relatedLabel}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{AGENDA_TYPE_LABELS[item.type]}</TableCell>
                      <TableCell>{item.organizationAcronym}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={statusLabel(item.status)}
                          tone={agendaTone(item.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Nenhum compromisso no filtro selecionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setForm(emptyForm);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova agenda</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="agenda-title">Título</Label>
              <Input
                id="agenda-title"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Ex.: Reunião de acompanhamento do CG"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      type: (value as AgendaEventType) ?? "reuniao",
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(AGENDA_TYPE_LABELS) as AgendaEventType[]).map(
                      (item) => (
                        <SelectItem key={item} value={item}>
                          {AGENDA_TYPE_LABELS[item]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agenda-org">Órgão</Label>
                <Input
                  id="agenda-org"
                  value={form.organizationAcronym}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      organizationAcronym: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="agenda-date">Data</Label>
                <Input
                  id="agenda-date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agenda-time">Horário</Label>
                <Input
                  id="agenda-time"
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, time: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agenda-location">Local</Label>
              <Input
                id="agenda-location"
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Ex.: Gabinete do Secretário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agenda-related">Referência (opcional)</Label>
              <Input
                id="agenda-related"
                value={form.relatedLabel}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    relatedLabel: e.target.value,
                  }))
                }
                placeholder="Ex.: CG-SED-2026"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreate}>
              Criar compromisso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
