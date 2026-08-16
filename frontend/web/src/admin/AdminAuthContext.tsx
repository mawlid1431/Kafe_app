import { createContext, useContext } from 'react';

const AdminAuthContext = createContext<string | undefined>(undefined);

export function AdminAuthProvider({
  adminToken,
  children,
}: {
  adminToken: string;
  children: React.ReactNode;
}) {
  return <AdminAuthContext.Provider value={adminToken}>{children}</AdminAuthContext.Provider>;
}

export function useAdminToken(): string | undefined {
  return useContext(AdminAuthContext);
}
