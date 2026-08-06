/**
 * Cria usuários de demonstração no Supabase Auth e vincula papéis/órgãos.
 *
 * Uso:
 *   1. Aplique as migrations e o seed SQL no projeto Supabase
 *   2. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 *   3. node --env-file=.env.local scripts/seed-demo-users.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = "SedMS@2026";

if (!url || !serviceKey) {
  console.error(
    "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ORG = {
  GOV: "11111111-1111-1111-1111-111111111001",
  SEGOV: "11111111-1111-1111-1111-111111111010",
  SED: "11111111-1111-1111-1111-111111111008",
};

const users = [
  {
    email: "admin@sed.ms.gov.br",
    full_name: "Ana Paula Ribeiro",
    role: "admin",
    orgs: [ORG.SED],
  },
  {
    email: "segov@sed.ms.gov.br",
    full_name: "Fernanda Oliveira Costa",
    role: "segov",
    orgs: [ORG.SEGOV],
  },
  {
    email: "secretario.sed@sed.ms.gov.br",
    full_name: "Marcos Antônio Silva",
    role: "secretario",
    orgs: [ORG.SED],
  },
  {
    email: "gestor.sed@sed.ms.gov.br",
    full_name: "Juliana Ferreira Santos",
    role: "gestor_projeto",
    orgs: [ORG.SED],
  },
  {
    email: "entrega.sed@sed.ms.gov.br",
    full_name: "Pedro Henrique Almeida",
    role: "responsavel_entrega",
    orgs: [ORG.SED],
  },
  {
    email: "avaliador@sed.ms.gov.br",
    full_name: "Camila Rodrigues Lima",
    role: "avaliador",
    orgs: [ORG.SED, ORG.SEGOV],
  },
];

async function upsertUser(user) {
  const { data: created, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: user.full_name,
      first_access_completed: true,
      must_change_password: false,
    },
  });

  if (error && !error.message.toLowerCase().includes("already")) {
    throw error;
  }

  let userId = created?.user?.id;
  if (!userId) {
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
    userId = list?.users?.find((u) => u.email === user.email)?.id;
  }

  if (!userId) {
    throw new Error(`Não foi possível obter id de ${user.email}`);
  }

  await supabase
    .from("profiles")
    .update({
      full_name: user.full_name,
      job_title: user.role,
      first_access_completed: true,
      must_change_password: false,
      status: "ativo",
    })
    .eq("id", userId);

  for (const [index, organizationId] of user.orgs.entries()) {
    await supabase.from("user_organization_roles").upsert(
      {
        user_id: userId,
        organization_id: organizationId,
        role: user.role,
        is_primary: index === 0,
      },
      { onConflict: "user_id,organization_id,role" },
    );
  }

  console.log(`✓ ${user.email} (${user.role})`);
}

async function main() {
  for (const user of users) {
    await upsertUser(user);
  }
  console.log("\nSenha padrão:", password);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
