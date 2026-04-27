import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { thirdwebAuth } from '@/lib/auth';
import Navigation from '../components/Navigation';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("thirdweb_auth_token")?.value;
  
  if (!token) {
    redirect('/login');
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: token });

  if (!authResult.valid || !authResult.parsedJWT.sub) {
    redirect('/api/auth/logout-redirect');
  }

  // Check admin role
  const profile = await prisma.profile.findUnique({ where: { id: authResult.parsedJWT.sub } });
  if (!profile || profile.role !== 'admin') {
    redirect('/chat');
  }

  return (
    <div className="h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
