import { createContext, useState } from "react";
import type { ReactNode } from "react";

type LoginData = {
  email: string;
  senha: string;
};

type AuthContextData = {
  signed: boolean;
  login(data: LoginData): Promise<void>;
  logout(): void;
};

export const AuthContext = createContext<AuthContextData | null>(null);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [signed, setSigned] = useState(false);

  async function login(_data: LoginData) {
    /**
     * depois a gente liga com o auth.service
     * agora só libera o fluxo da aplicação
     */
    setSigned(true);
  }

  function logout() {
    setSigned(false);
  }

  return (
    <AuthContext.Provider
      value={{
        signed,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
