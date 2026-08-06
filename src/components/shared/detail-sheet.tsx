"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Copy,
  ExternalLink,
  Forward,
  MessageSquare,
  Send,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface DetailField {
  label: string;
  value: ReactNode;
}

export interface DetailHistoryItem {
  title: string;
  actor?: string;
  at?: string;
}

interface DetailMessage {
  text: string;
  at?: string;
  muted?: boolean;
}

interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  contextLabel?: string;
  metaLabel?: string;
  metaValue?: string;
  metaSubtext?: string;
  fields: DetailField[];
  messages?: DetailMessage[];
  history?: DetailHistoryItem[];
  footerHref?: string;
  footerLabel?: string;
  className?: string;
  children?: ReactNode;
}

function formatNow() {
  return new Date().toLocaleString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function plainTextFromNode(value: ReactNode): string {
  if (value == null || value === false) return "—";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "[conteúdo]";
}

export function DetailSheet({
  open,
  onOpenChange,
  title,
  description,
  contextLabel = "Detalhes",
  metaLabel = "Código",
  metaValue,
  metaSubtext,
  fields,
  messages: initialMessages,
  history: initialHistory,
  footerHref,
  footerLabel = "Abrir página completa",
  className,
  children,
}: DetailSheetProps) {
  const [localMessages, setLocalMessages] = useState<DetailMessage[]>(
    initialMessages ?? [],
  );
  const [localHistory, setLocalHistory] = useState<DetailHistoryItem[]>(
    initialHistory ?? [],
  );
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [forwardOpen, setForwardOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setCommentOpen(false);
      setCommentText("");
      setForwardOpen(false);
      return;
    }
    setLocalMessages(initialMessages ?? []);
    setLocalHistory(initialHistory ?? []);
  }, [open, initialMessages, initialHistory, title, metaValue]);

  function copyMeta() {
    if (!metaValue) {
      toast.error("Não há código para copiar.");
      return;
    }
    void navigator.clipboard.writeText(metaValue);
    toast.success(`${metaLabel} copiado.`);
  }

  function buildSummary() {
    const lines = [
      `${contextLabel}: ${title}`,
      description ? `Situação: ${description}` : null,
      metaValue ? `${metaLabel}: ${metaValue}` : null,
      metaSubtext ?? null,
      "",
      "Campos:",
      ...fields.map(
        (field) => `- ${field.label}: ${plainTextFromNode(field.value)}`,
      ),
      footerHref
        ? `\nLink: ${typeof window !== "undefined" ? `${window.location.origin}${footerHref}` : footerHref}`
        : null,
    ].filter(Boolean);
    return lines.join("\n");
  }

  function handleForwardCopy() {
    void navigator.clipboard.writeText(buildSummary());
    toast.success("Resumo copiado para encaminhar.");
    setForwardOpen(false);
  }

  function handleForwardLink() {
    if (!footerHref) {
      toast.error("Este registro não possui página completa para compartilhar.");
      return;
    }
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${footerHref}`
        : footerHref;
    void navigator.clipboard.writeText(url);
    toast.success("Link copiado.");
    setForwardOpen(false);
  }

  function handleSaveComment() {
    const text = commentText.trim();
    if (!text) {
      toast.error("Escreva um comentário antes de salvar.");
      return;
    }
    const at = formatNow();
    setLocalMessages((prev) => [{ text, at }, ...prev]);
    setLocalHistory((prev) => [
      {
        title: "Comentário adicionado",
        actor: "Você",
        at,
      },
      ...prev,
    ]);
    setCommentText("");
    setCommentOpen(false);
    toast.success("Comentário registrado.");
  }

  function handleContextAction() {
    if (footerHref) {
      onOpenChange(false);
      window.location.assign(footerHref);
      return;
    }
    const formSection = document.getElementById("detail-sheet-form");
    formSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast.message(`${contextLabel}: formulário do registro.`);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          "flex h-full max-h-dvh w-full flex-col gap-0 overflow-hidden border-l border-[rgba(195,201,232,0.6)] bg-[#f4f5ff] p-0 shadow-[0px_8px_12px_rgba(0,0,0,0.16)] data-[side=right]:sm:max-w-[min(960px,92vw)]",
          className,
        )}
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {description ? (
          <SheetDescription className="sr-only">{description}</SheetDescription>
        ) : null}

        <header className="sticky top-0 z-10 shrink-0 bg-[#f4f5ff]">
          <div className="flex items-center justify-between gap-4 border-b border-[rgba(195,201,232,0.6)] px-6 py-4">
            <button
              type="button"
              onClick={handleContextAction}
              className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-[rgba(195,201,232,0.6)] bg-[rgba(195,201,232,0.2)] py-2 pr-2 pl-4 transition-colors hover:bg-[rgba(195,201,232,0.35)]"
              aria-label={`Abrir contexto ${contextLabel}`}
            >
              <Sparkles className="size-4 shrink-0 text-[#394aa5]" aria-hidden />
              <span className="truncate text-sm font-medium text-[#394aa5]">
                {contextLabel}
              </span>
              <Forward className="size-4 shrink-0 text-[#394aa5]" aria-hidden />
            </button>

            <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-[#576175] hover:bg-[rgba(195,201,232,0.35)] hover:text-[#232d64]"
                onClick={() => setForwardOpen(true)}
              >
                <Share2 className="size-4" />
                <span className="hidden sm:inline">Encaminhar</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-[#576175] hover:bg-[rgba(195,201,232,0.35)] hover:text-[#232d64]"
                onClick={() => setCommentOpen(true)}
              >
                <MessageSquare className="size-4" />
                <span className="hidden sm:inline">Comentário</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-[#576175] hover:bg-[rgba(195,201,232,0.35)] hover:text-[#232d64]"
                aria-label="Fechar"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-[rgba(195,201,232,0.6)] px-4 py-1">
            <div className="flex min-w-0 flex-1 items-center gap-4 rounded-lg p-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(195,201,232,0.6)] bg-[#f4f5ff]">
                <span className="size-2 rounded-full bg-[#394aa5]" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#394aa5]">
                  {title}
                </p>
                {description ? (
                  <p className="truncate text-xs text-[#6c7993]">{description}</p>
                ) : null}
              </div>
            </div>

            {(metaValue || metaSubtext) && (
              <div className="flex min-w-0 flex-1 flex-col items-end justify-center rounded-lg p-2 text-right">
                {metaValue ? (
                  <div className="flex items-start justify-end gap-2">
                    <button
                      type="button"
                      className="text-xs font-semibold whitespace-nowrap text-[#394aa5] hover:underline"
                      onClick={copyMeta}
                      title="Clique para copiar"
                    >
                      {metaLabel}: {metaValue}
                    </button>
                    <button
                      type="button"
                      className="text-[#394aa5] hover:opacity-80"
                      aria-label="Copiar código"
                      onClick={copyMeta}
                    >
                      <Copy className="size-4" />
                    </button>
                  </div>
                ) : null}
                {metaSubtext ? (
                  <p className="text-xs text-[#6c7993]">{metaSubtext}</p>
                ) : null}
              </div>
            )}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#e4e7f8]/40">
          <div className="flex flex-col gap-8 p-6">
            {localMessages.length > 0 ? (
              <section className="space-y-1">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-[#232d64]">Mensagem</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setCommentOpen(true)}
                  >
                    <MessageSquare className="size-3.5" />
                    Novo comentário
                  </Button>
                </div>
                {localMessages.map((message, index) => (
                  <div
                    key={`${message.text}-${index}`}
                    className={cn(
                      "flex gap-4 border-b border-[rgba(195,201,232,0.6)] py-4",
                      message.muted && "opacity-60",
                    )}
                  >
                    <p className="min-w-0 flex-1 text-sm font-medium text-[#394aa5]">
                      {message.text}
                    </p>
                    {message.at ? (
                      <p className="shrink-0 text-right text-[11px] font-semibold text-[#6c7993]">
                        {message.at}
                      </p>
                    ) : null}
                  </div>
                ))}
              </section>
            ) : null}

            <section id="detail-sheet-form" className="space-y-4 scroll-mt-4">
              <h3 className="text-xl font-bold text-[#232d64]">Formulário</h3>
              <div className="overflow-hidden rounded-lg border border-[rgba(195,201,232,0.6)] bg-[#f4f5ff]">
                <div className="flex border-b border-[rgba(195,201,232,0.6)] bg-[#e4e7f8]">
                  <div className="flex h-12 w-[40%] items-center px-6 py-2 sm:w-[331px] sm:max-w-[45%]">
                    <span className="text-xs font-semibold text-[#232d64]">
                      CAMPO
                    </span>
                  </div>
                  <div className="flex h-12 min-w-0 flex-1 items-center px-6 py-2">
                    <span className="text-xs font-semibold text-[#232d64]">
                      DADOS
                    </span>
                  </div>
                </div>
                {fields.map((field) => (
                  <div
                    key={field.label}
                    className="flex min-h-12 border-b border-[rgba(195,201,232,0.6)] last:border-b-0"
                  >
                    <div className="flex w-[40%] items-center px-6 py-3 sm:w-[331px] sm:max-w-[45%]">
                      <span className="text-sm font-medium text-[#232d64]">
                        {field.label}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2 px-6 py-3">
                      <div className="min-w-0 flex-1 text-sm font-medium break-words text-[#394aa5]">
                        {field.value ?? "—"}
                      </div>
                      {typeof field.value === "string" ||
                      typeof field.value === "number" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-[#6c7993]"
                          aria-label={`Copiar ${field.label}`}
                          onClick={() => {
                            void navigator.clipboard.writeText(
                              String(field.value),
                            );
                            toast.success(`${field.label} copiado.`);
                          }}
                        >
                          <Copy className="size-3.5" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {fields.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-[#6c7993]">
                    Nenhum dado disponível.
                  </p>
                ) : null}
              </div>
            </section>

            {children}

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-[#232d64]">Histórico</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    const at = formatNow();
                    setLocalHistory((prev) => [
                      {
                        title: "Registro visualizado",
                        actor: "Você",
                        at,
                      },
                      ...prev,
                    ]);
                    toast.success("Evento adicionado ao histórico.");
                  }}
                >
                  Registrar visualização
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-[rgba(195,201,232,0.6)] bg-[#f4f5ff]">
                {localHistory.length > 0 ? (
                  localHistory.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="flex items-start gap-3 border-b border-[rgba(195,201,232,0.6)] px-4 py-3 last:border-b-0"
                    >
                      <span
                        className="mt-1 size-2.5 shrink-0 rounded-full bg-[#7d141d]"
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#232d64]">
                          {item.title}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#6c7993]">
                          {item.actor ? <span>{item.actor}</span> : null}
                          {item.at ? <span>{item.at}</span> : null}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-6 text-sm text-[#6c7993]">
                    Sem eventos no histórico. Use “Registrar visualização” ou
                    adicione um comentário.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        <footer className="shrink-0 border-t border-[rgba(195,201,232,0.6)] bg-[#f4f5ff] p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1 gap-2"
              onClick={() => setForwardOpen(true)}
            >
              <Share2 className="size-4" />
              Encaminhar
            </Button>
            {footerHref ? (
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={footerHref}
                    onClick={() => onOpenChange(false)}
                  />
                }
                className="h-10 flex-1 gap-2 bg-[#394aa5] text-white hover:bg-[#2f3d8a]"
              >
                <ExternalLink className="size-4" />
                {footerLabel}
              </Button>
            ) : (
              <Button
                type="button"
                className="h-10 flex-1 gap-2 bg-[#394aa5] text-white hover:bg-[#2f3d8a]"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            )}
          </div>
        </footer>
      </SheetContent>

      <Dialog open={commentOpen} onOpenChange={setCommentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo comentário</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escreva o comentário sobre este registro..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveComment();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCommentOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" className="gap-1.5" onClick={handleSaveComment}>
              <Send className="size-4" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={forwardOpen} onOpenChange={setForwardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Encaminhar registro</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Escolha como deseja compartilhar <strong>{title}</strong>
            {metaValue ? ` (${metaValue})` : ""}.
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              className="w-full gap-2"
              onClick={handleForwardCopy}
            >
              <Copy className="size-4" />
              Copiar resumo completo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleForwardLink}
              disabled={!footerHref}
            >
              <ExternalLink className="size-4" />
              Copiar link da página
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setForwardOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
