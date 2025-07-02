"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, ArrowRight } from "lucide-react";
import { Logo } from "@/components/icons/logo";
import { useAuth } from "@/context/auth-context";

export function LandingNav() {
    const { user, loading } = useAuth();

    return (
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">ChronoVault</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/public">Public Capsules</Link>
          </Button>
          {!loading && (
            user ? (
                <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
            ) : (
                <Button variant="ghost" asChild>
                    <Link href="/login">Log In</Link>
                </Button>
            )
          )}
          <Button asChild>
            <Link href={user ? "/create" : "/signup"}>Get Started <ArrowRight className="ml-2" /></Link>
          </Button>
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <div className="flex flex-col gap-4 p-4">
                     <Link href="/" className="flex items-center gap-2 mb-4">
                        <Logo className="size-8 text-primary" />
                        <span className="text-xl font-bold font-headline text-foreground">ChronoVault</span>
                    </Link>
                    <SheetClose asChild>
                        <Button variant="ghost" className="justify-start" asChild>
                            <Link href="/public">Public Capsules</Link>
                        </Button>
                    </SheetClose>
                    {!loading && (
                        user ? (
                        <SheetClose asChild>
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        </SheetClose>
                        ) : (
                        <SheetClose asChild>
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="/login">Log In</Link>
                            </Button>
                        </SheetClose>
                        )
                    )}
                    <SheetClose asChild>
                        <Button className="w-full justify-center" asChild>
                            <Link href={user ? "/create" : "/signup"}>Get Started <ArrowRight className="ml-2" /></Link>
                        </Button>
                    </SheetClose>
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    )
}
