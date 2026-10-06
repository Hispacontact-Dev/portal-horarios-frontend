export type Role = "gestion_humana" | "lider";

export interface Session {
  token: string;
  role: Role;
  issuedAt: string;
  lastActivityAt: string;
}
