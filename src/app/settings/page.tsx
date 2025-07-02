"use client";

import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, User, KeyRound } from "lucide-react";

export default function SettingsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center p-8">
            <Loader2 className="size-12 animate-spin text-primary" />
        </div>
    )
  }

  if (!user) {
    // This should ideally not be reached due to AppLayout protection, but it's good practice.
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and preferences.
        </p>
      </header>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User /> Account Information</CardTitle>
            <CardDescription>Your personal account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={user.email || ''} disabled />
            </div>
             <div className="space-y-2">
              <Label htmlFor="uid">User ID</Label>
              <Input id="uid" type="text" value={user.uid} disabled />
               <p className="text-xs text-muted-foreground">This is your unique identifier within the system.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
           <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound /> Security</CardTitle>
            <CardDescription>Manage your password and account security settings.</CardDescription>
          </CardHeader>
           <CardContent className="space-y-4">
             <Button disabled>Change Password (Coming Soon)</Button>
             <Button variant="destructive" disabled>Delete Account (Coming Soon)</Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
