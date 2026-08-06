import { PublicProgramDetailClient } from "@/features/public/components/public-program-detail-client";

export const metadata = {
  title: "Programa público",
};

export default async function PublicoProgramaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicProgramDetailClient id={id} />;
}
