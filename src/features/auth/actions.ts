"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEMO_COOKIE,
  DEMO_PASSWORD,
  findDemoAccount,
  isDemoMode,
} from "@/lib/auth/demo-users";
import { encodeDemoCookie } from "@/lib/auth/session";
import { getDefaultDashboardPath } from "@/lib/rbac/permissions";
import {
  changePasswordSchema,
  firstAccessSchema,
  loginSchema,
  recoverPasswordSchema,
} from "@/lib/validators/auth";

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  if (isDemoMode()) {
    const account = findDemoAccount(email);
    if (!account || password !== DEMO_PASSWORD) {
      return {
        success: false,
        message: "E-mail ou senha inválidos.",
      };
    }

    const cookieStore = await cookies();
    cookieStore.set(
      DEMO_COOKIE,
      encodeDemoCookie({
        email: account.email,
        activeOrganizationId: account.organizations[0]?.id,
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      },
    );

    redirect(getDefaultDashboardPath(account.role));
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "login",
        entity: "session",
        entity_id: user.id,
      });

      const { data: roles } = await supabase
        .from("user_organization_roles")
        .select("role")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .limit(1);

      redirect(getDefaultDashboardPath((roles?.[0]?.role as never) ?? "publico"));
    }

    redirect("/dashboard");
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return {
      success: false,
      message: "Não foi possível autenticar. Tente novamente.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    cookieStore.delete({ name: DEMO_COOKIE, path: "/" });
    cookieStore.delete({ name: "sed-ms-active-org", path: "/" });
    redirect("/login");
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "logout",
        entity: "session",
        entity_id: user.id,
      });
    }
    await supabase.auth.signOut();
  } finally {
    redirect("/login");
  }
}

export async function recoverPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = recoverPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Informe um e-mail válido.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (isDemoMode()) {
    return {
      success: true,
      message:
        `No modo demonstração, use a senha ${DEMO_PASSWORD} para qualquer usuário de teste.`,
    };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/alterar-senha`,
    });
    return {
      success: true,
      message:
        "Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.",
    };
  } catch {
    return {
      success: false,
      message: "Não foi possível enviar a recuperação de senha.",
    };
  }
}

export async function firstAccessAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = firstAccessSchema.safeParse({
    email: formData.get("email"),
    temporaryPassword: formData.get("temporaryPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (isDemoMode()) {
    const account = findDemoAccount(parsed.data.email);
    if (!account || parsed.data.temporaryPassword !== DEMO_PASSWORD) {
      return {
        success: false,
        message: "Credenciais temporárias inválidas.",
      };
    }
    return {
      success: true,
      message:
        `Senha atualizada no modo demonstração. Faça login com ${DEMO_PASSWORD}.`,
    };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.temporaryPassword,
    });
    if (error) {
      return { success: false, message: "Credenciais temporárias inválidas." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });
    if (updateError) {
      return { success: false, message: updateError.message };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({
          must_change_password: false,
          first_access_completed: true,
        })
        .eq("id", user.id);
    }

    return {
      success: true,
      message: "Primeiro acesso concluído. Você já pode utilizar o sistema.",
    };
  } catch {
    return {
      success: false,
      message: "Não foi possível concluir o primeiro acesso.",
    };
  }
}

export async function changePasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos do formulário.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (isDemoMode()) {
    if (parsed.data.currentPassword !== DEMO_PASSWORD) {
      return { success: false, message: "Senha atual incorreta." };
    }
    return {
      success: true,
      message:
        `No modo demonstração a senha permanece ${DEMO_PASSWORD} para todos os usuários de teste.`,
    };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return { success: false, message: "Sessão inválida." };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });
    if (signInError) {
      return { success: false, message: "Senha atual incorreta." };
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });
    if (error) {
      return { success: false, message: error.message };
    }

    await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", user.id);

    return { success: true, message: "Senha alterada com sucesso." };
  } catch {
    return { success: false, message: "Não foi possível alterar a senha." };
  }
}

export async function setActiveOrganizationAction(
  organizationId: string,
): Promise<ActionResult> {
  const cookieStore = await cookies();

  if (isDemoMode()) {
    const raw = cookieStore.get(DEMO_COOKIE)?.value;
    if (!raw) {
      return { success: false, message: "Sessão inválida." };
    }
    try {
      const payload = JSON.parse(
        Buffer.from(raw, "base64url").toString("utf8"),
      ) as { email: string; activeOrganizationId?: string | null };
      cookieStore.set(
        DEMO_COOKIE,
        encodeDemoCookie({
          email: payload.email,
          activeOrganizationId: organizationId,
        }),
        {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 8,
        },
      );
      return { success: true };
    } catch {
      return { success: false, message: "Sessão inválida." };
    }
  }

  cookieStore.set("sed-ms-active-org", organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return { success: true };
}
