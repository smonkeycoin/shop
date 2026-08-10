import type { AdminRole } from "@/types/database.types";

export const ADMIN_ALLOWLIST = {
  "trinopc1@gmail.com": "owner",
  "melissa.ig.mo@gmail.com": "admin",
  "karina.iglesiaz@gmail.com": "admin",
} as const satisfies Record<string, AdminRole>;

export type AdminAllowlistEmail = keyof typeof ADMIN_ALLOWLIST;

export function normalizeAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

export function getBootstrapAdminRole(email?: string | null) {
  const normalizedEmail = normalizeAdminEmail(email);
  return ADMIN_ALLOWLIST[normalizedEmail as AdminAllowlistEmail] ?? null;
}

export function isBootstrapAdminEmail(email?: string | null) {
  return Boolean(getBootstrapAdminRole(email));
}
