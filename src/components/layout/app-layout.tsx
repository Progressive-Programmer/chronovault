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

const protectedRoutes = ["/dashboard", "/create", "/settings"];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isLandingPage = pathname === "/";

  useEffect(() => {
    if (!auth.loading && !auth.user && protectedRoutes.some(path => pathname.startsWith(path))) {
      router.push('/login');
    }
  }, [auth.loading, auth.user, pathname, router]);

  if (isLandingPage || isAuthPage) {
    return <>{children}</>;
  }

  if (auth.loading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="size-12 animate-spin text-primary" />
        </div>
    )
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
                    <AvatarFallback>{auth.user?.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold truncate">{auth.user?.email}</span>
                </div>
             </div>
             <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:w-full" onClick={auth.signOut}>
                <LogOut />
             </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
