import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Interface do usuário que será recebido do sistema pai
export interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  avatar?: string;
}

// Props para receber usuário do sistema pai
export interface UserProviderProps {
  children: ReactNode;
  // Usuário pode ser passado diretamente via props (integração com sistema pai)
  initialUser?: User;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  isAuthenticated: boolean;
}

// Usuário padrão (fallback quando não integrado)
const DEFAULT_USER: User = {
  id: 'default',
  name: 'Administrador',
  email: 'admin@sistema.com',
  role: 'admin',
  department: 'TI'
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({
  children,
  initialUser
}) => {
  const [user, setUserState] = useState<User>(initialUser || DEFAULT_USER);

  const setUser = useCallback((newUser: User) => {
    setUserState(newUser);
  }, []);

  const isAuthenticated = user.id !== 'default';

  const value: UserContextType = {
    user,
    setUser,
    isAuthenticated
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Hook para obter apenas o nome do usuário (mais simples de usar)
export const useCurrentUser = (): string => {
  const { user } = useUser();
  return user.name;
};

export default UserContext;
