export interface UserSummary
{
    id: string;
  displayName: string;
  email: string;
  roles: string[];
}

export interface ChangeUserRoleRequest
{
    role: string;
}