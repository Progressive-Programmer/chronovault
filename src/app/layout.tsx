import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChronoVault',
  description: 'Send messages to the future.',
};

const MissingFirebaseConfig = () => (
    <div className="flex h-screen items-center justify-center bg-amber-50">
        <div className="max-w-2xl rounded-lg border border-amber-300 bg-white p-8 text-center shadow-lg">
            <h1 className="text-2xl font-bold font-headline text-amber-800">
                Firebase Configuration Missing
            </h1>
            <p className="mt-4 text-gray-700">
                The application cannot start because the Firebase configuration is missing.
                Please add your Firebase project's credentials to the
                <code className="mx-1 rounded bg-amber-100 px-1 py-0.5 text-sm font-semibold text-amber-900">.env</code>
                file at the root of your project.
            </p>
            <p className="mt-2 text-sm text-gray-500">
                You can find these keys in your Firebase project settings.
            </p>
        </div>
    </div>
);


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,14..72,400;0,14..72,700;1,14..72,400;1,14..72,700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {!isFirebaseConfigured ? (
            <MissingFirebaseConfig />
        ) : (
            <AuthProvider>
              <AppLayout>
                {children}
              </AppLayout>
              <Toaster />
            </AuthProvider>
        )}
      </body>
    </html>
  );
}
