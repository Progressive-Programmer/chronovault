import { SignUpForm } from './signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                         <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                            <Logo className="size-8 text-primary" />
                            <span className="text-2xl font-bold font-headline text-foreground">ChronoVault</span>
                        </Link>
                        <CardTitle className="font-headline">Create Your Account</CardTitle>
                        <CardDescription>Join ChronoVault to start sending messages to the future.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SignUpForm />
                        <p className="mt-4 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-primary hover:underline">
                                Log In
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
