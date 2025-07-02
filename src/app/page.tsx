import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Lock, Send, Share2 } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <span className="text-xl font-bold font-headline text-foreground">ChronoVault</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/public">Public Capsules</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/create">Get Started <ArrowRight className="ml-2" /></Link>
          </Button>
        </nav>
        <Button className="md:hidden" variant="outline" asChild>
             <Link href="/dashboard">Menu</Link>
        </Button>
      </header>

      <main className="flex-grow">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-foreground">
              Preserve Today's Moments for Tomorrow's You
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              ChronoVault lets you seal digital time capsules — messages, photos, and memories — to be opened on a future date you choose.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/create">Create Your First Capsule <Send className="ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/public">Explore Public Vaults</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-card border-y">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">A Simple Journey Through Time</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Creating a message for the future is as easy as 1-2-3.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center p-4">
                        <div className="flex justify-center items-center mb-4 mx-auto size-16 rounded-full bg-primary/10 text-primary">
                            <Send className="size-8" />
                        </div>
                        <h3 className="text-xl font-headline font-semibold">1. Craft Your Message</h3>
                        <p className="mt-2 text-muted-foreground">Write a letter, attach photos, and pour your current thoughts into a digital capsule.</p>
                    </div>
                     <div className="text-center p-4">
                        <div className="flex justify-center items-center mb-4 mx-auto size-16 rounded-full bg-primary/10 text-primary">
                            <Lock className="size-8" />
                        </div>
                        <h3 className="text-xl font-headline font-semibold">2. Seal and Secure</h3>
                        <p className="mt-2 text-muted-foreground">Choose an opening date and specify who can open it. Your memories are encrypted and safe.</p>
                    </div>
                     <div className="text-center p-4">
                        <div className="flex justify-center items-center mb-4 mx-auto size-16 rounded-full bg-primary/10 text-primary">
                            <Share2 className="size-8" />
                        </div>
                        <h3 className="text-xl font-headline font-semibold">3. Await the Future</h3>
                        <p className="mt-2 text-muted-foreground">On the chosen date, your capsule is delivered. Relive the moment or share it with others.</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline">For Every Milestone, and Every "Just Because"</h2>
                        <p className="mt-4 text-lg text-muted-foreground">Create capsules for your future self, anniversaries, your children's birthdays, or just a random Tuesday. What will you tell your future?</p>
                        <Button size="lg" asChild className="mt-8">
                            <Link href="/create">Start a new tradition</Link>
                        </Button>
                    </div>
                     <div>
                        <Card className="overflow-hidden rounded-xl shadow-lg">
                           <Image src="https://placehold.co/600x400.png" width={600} height={400} alt="A collage of memories" className="w-full" data-ai-hint="vintage letters photos"/>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ChronoVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
