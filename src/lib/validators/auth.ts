import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail institucional")
    .email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const recoverPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail institucional")
    .email("E-mail inválido"),
});

export const firstAccessSchema = z
  .object({
    email: z.string().email("E-mail inválido"),
    temporaryPassword: z.string().min(1, "Informe a senha temporária"),
    newPassword: z
      .string()
      .min(8, "A nova senha deve ter ao menos 8 caracteres")
      .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Inclua ao menos um número")
      .regex(/[^A-Za-z0-9]/, "Inclua ao menos um caractere especial"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z
      .string()
      .min(8, "A nova senha deve ter ao menos 8 caracteres")
      .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Inclua ao menos um número")
      .regex(/[^A-Za-z0-9]/, "Inclua ao menos um caractere especial"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RecoverPasswordInput = z.infer<typeof recoverPasswordSchema>;
export type FirstAccessInput = z.infer<typeof firstAccessSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
