import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Ajuda" };

export default function AjudaPage() {
  return (
    <div>
      <PageHeader
        title="Ajuda"
        description="Orientação rápida de uso do SID-SED (Secretaria de Estado de Educação de MS)."
        breadcrumbs={[
          { label: "Visão geral", href: "/dashboard" },
          { label: "Ajuda" },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acesso e perfis</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            O menu e as telas variam conforme o perfil. Gestores da SED acompanham
            o Contrato de Gestão, projetos e entregas; a SEGOV atua na validação
            institucional do contrato.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cadastros institucionais</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Em Administração você gerencia a estrutura da SED, usuários,
            municípios da rede e alinhamentos estratégicos (pilares, ODS e PPA).
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
