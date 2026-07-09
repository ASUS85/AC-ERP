import api from "./client";

export type RolePayload = {
  nomRole: string;
  description?: string | null;
  isSystemRole?: boolean;
};

export type PermissionItem = {
  id: string;
  module: string;
  action: string;
  description?: string | null;
};

export type RoleItem = {
  id: string;
  nomRole: string;
  description?: string | null;
  isSystemRole?: boolean;
  permissions?: Array<{
    idRole: string;
    idPermission: string;
    permission?: PermissionItem;
  }>;
};

export async function getRoles(
  params?: Record<string, string | number | undefined>,
) {
  const response: any = await api.get("/roles", { params });
  return response;
}

export async function getPermissions() {
  const response: any = await api.get("/roles/permissions");
  return response;
}

export async function createRole(payload: RolePayload) {
  const response: any = await api.post("/roles", payload);
  return response;
}

export async function updateRole(id: string, payload: Partial<RolePayload>) {
  const response: any = await api.put(`/roles/${id}`, payload);
  return response;
}

export async function deleteRole(id: string) {
  const response: any = await api.delete(`/roles/${id}`);
  return response;
}

export async function updateRolePermissions(
  id: string,
  permissionIds: string[],
) {
  const response: any = await api.put(`/roles/${id}/permissions`, {
    permissionIds,
  });
  return response;
}
