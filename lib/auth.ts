import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        // I don't know if this is actually necessary since I'm using a custom signin page
        username: { label: 'Username', type: 'text'},
        password: { label: 'Password', type: 'password'}
      },
      async authorize(credentials, req) {
        if ((credentials?.username === process.env.USERNAME) && (credentials?.password === process.env.PASSWORD)) {
          const user = { id: 'user', name: 'admin'}
          return user;
        }
        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login'
  }
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}