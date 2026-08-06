import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Ajuda" };

export default function AjudaPage() {
  return (
    <div>
      <PageHeader
        title="Ajuda"
        description="Orientação rápida de uso do SID-MS."
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
            O menu e as telas variam conforme o perfil. Governador e SEGOV veem
            o consolidado estadual; secretarias veem apenas o próprio escopo.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cadastros institucionais</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Em Administração você gerencia órgãos, estrutura, usuários,
            municípios e alinhamentos estratégicos (pilares, ODS e PPA).
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
