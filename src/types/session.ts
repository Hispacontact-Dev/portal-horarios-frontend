export type Role = "junta_directiva" | "lider";

export interface Session {
  token: string;
  role: Role;
  issuedAt: string;
  lastActivityAt: string;
}
