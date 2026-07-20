import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getMe, type UserProfile } from "@/lib/api/auth.service"; // Assurez-vous que UserProfile inclut `permissions: string[]`

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("erp_access_token"); // ou votre clé de stockage
      if (token) {
        const response: any = await getMe();
        setUser(response.data || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Échec de la récupération de l'utilisateur:", error);
      setUser(null); // Déconnexion en cas d'erreur (ex: token expiré)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // Écouter les changements d'authentification pour re-synchroniser
    window.addEventListener("auth-change", fetchUser);
    return () => window.removeEventListener("auth-change", fetchUser);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetchUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider. Make sure it is at the root of your application.",
    );
  }
  return context;
}
