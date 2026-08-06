import { redirect } from "next/navigation";

export const metadata = { title: "Exportações" };

/** Mantido por compatibilidade: exportações ficam na aba Relatórios. */
export default function ExportacoesPage() {
  redirect("/relatorios");
}
