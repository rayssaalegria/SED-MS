import { PublicProjectDetailClient } from "@/features/public/components/public-project-detail-client";

export const metadata = {
  title: "Projeto público",
};

export default async function PublicoProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicProjectDetailClient id={id} />;
}
