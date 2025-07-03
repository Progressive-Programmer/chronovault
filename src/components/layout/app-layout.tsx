"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import {
  LayoutDashboard,
  PlusCircle,
  Globe,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "Create Capsule", icon: PlusCircle },
  { href: "/public", label: "Public Capsules", icon: Globe },
  { href: "/settings", label: "Settings", icon: Settings },
];

const protectedRoutes = ["/dashboard", "/create", "/settings", "/capsules"];
const authRoutes = ["/login", "/signup"];


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();

  const isAuthPage = authRoutes.includes(pathname);
  const isLandingPage = pathname === "/";

  useEffect(() => {
    if (auth.loading) return; // Wait for auth state to be determined

    const isProtectedRoute = protectedRoutes.some(path => pathname.startsWith(path));

    // If user is not logged in and tries to access a protected route, redirect to login
    if (!auth.user && isProtectedRoute) {
      router.push('/login');
    }
    
    // If user IS logged in and tries to access login/signup, redirect to dashboard
    if (auth.user && isAuthPage) {
        router.push('/dashboard');
    }

  }, [auth.loading, auth.user, pathname, router, isAuthPage]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  // If auth is loading, show a loader. This handles the initial page load.
  if (auth.loading) {
     return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="size-12 animate-spin text-primary" />
        </div>
    );
  }

  // Do not render the full layout for landing and auth pages.
  if (isLandingPage || isAuthPage) {
    // If user IS logged in and on an auth page, show a loader until the redirect happens.
     if (auth.user && isAuthPage) {
       return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="size-12 animate-spin text-primary" />
          </div>
      );
    }
    return <>{children}</>;
  }


  // This should not be reached by unauthenticated users on protected routes due to the useEffect redirect,
  // but as a fallback, we prevent rendering the layout.
  if (!auth.user) {
      return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <span className="text-xl font-bold font-headline">ChronoVault</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && (item.href !== "/" || pathname === "/")}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <div className="flex items-center justify-between p-2 group-data-[collapsible=icon]:justify-center">
             <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <Avatar className="size-8">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                    <AvatarFallback>{auth.userData?.name?.charAt(0).toUpperCase() || auth.user?.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">{auth.userData?.name || auth.user?.email}</span>
                </div>
             </div>
             <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:w-full" onClick={handleSignOut}>
                <LogOut />
             </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline">
                <Logo className="size-6 text-primary" />
                <span>ChronoVault</span>
            </Link>
            <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
