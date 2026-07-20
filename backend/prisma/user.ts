export interface Permission {
  id: string;
  module: string;
  action: string;
}

export interface Role {
  id: string;
  nomRole: string;
  permissions: {
    permission: Permission;
  }[];
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  avatar: string | null;
  role: Role;
}
