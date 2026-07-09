import api from "./client";

export type UserPayload = {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  idRole: string;
  statut?: "ACTIF" | "INACTIF" | "BLOQUE";
  motDePasseTemp?: string;
};

export async function getUsers(
  params?: Record<string, string | number | undefined>,
) {
  const response: any = await api.get("/utilisateurs", { params });
  return response;
}

export async function getUser(id: string) {
  const response: any = await api.get(`/utilisateurs/${id}`);
  return response;
}

export async function createUser(payload: UserPayload) {
  const response: any = await api.post("/utilisateurs", payload);
  return response;
}

export async function updateUser(id: string, payload: Partial<UserPayload>) {
  const response: any = await api.put(`/utilisateurs/${id}`, payload);
  return response;
}

export async function deleteUser(id: string) {
  const response: any = await api.delete(`/utilisateurs/${id}`);
  return response;
}

export async function getRoles() {
  const response: any = await api.get("/roles");
  return response;
}
