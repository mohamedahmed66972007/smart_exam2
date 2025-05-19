interface AppAuth {
  isAuthenticated: boolean;
  user: any;
  logout: () => void;
  login: (token: string, user: any) => void;
}

declare global {
  interface Window {
    appAuth: AppAuth;
  }
}

export {};