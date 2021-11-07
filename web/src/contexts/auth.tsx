import { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '../services/api';

type User = {
 id: string;
 name: string;
 login: string;
 avatar_url: string;
}

type AuthResponse = {
 token: string;
 user: {
     id: string;
     avatar_url: string;
     name: string;
     login: string;
}
}

type AuthContextData = {
 user: User | null;
 signInUrl: string;
 signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextData);

 type AuthProvider = {
  children: ReactNode;
 }

export function AuthProvider(props: AuthProvider) {

 const [user, setUser] = useState<User | null>(null);

 const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=b92a08e223d38ff68180`;

    async function signIn(githubCode: string) {
        const response = await api.post<AuthResponse>('Authenticate', {
            code: githubCode,
        })

        const { token, user } = response.data;

        localStorage.setItem('@dowhile:token', token);

        api.defaults.headers.common.authorization = `Bearer ${token}`;

        setUser(user);
    }

    function signOut() {
        localStorage.removeItem('@dowhile:token');

        setUser(null);
    }

    useEffect(() => {
     const token = localStorage.getItem('@dowhile:token');

     if (token) {
         api.defaults.headers.common.authorization = `Bearer ${token}`;
         api.get<User>('profile').then(response => {
          setUser(response.data);
         })
        }
    }, []);

    useEffect(() => {
        const url = window.location.href;
        const hasGithubCode = url.includes('?code=');

        if (hasGithubCode) {
            const [urlWithoutCode, githubCode] = url.split('?code=')
            
            window.history.pushState({}, '', urlWithoutCode);

            signIn(githubCode);
        }
    }, [])
 return (
  <AuthContext.Provider value={{signInUrl, user, signOut}}>
   {props.children}
   </AuthContext.Provider>
 );
}