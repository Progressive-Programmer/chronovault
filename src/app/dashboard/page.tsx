"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CapsuleList } from "@/components/capsule-list";
import type { Capsule, CapsuleDoc, CapsuleStatus } from "@/types/capsule";
import { PlusCircle, Clock, Gift, Archive, Loader2 } from "lucide-react";
import Link from "next/link";
import { getCapsulesForUser } from "@/lib/actions";
import { useAuth } from '@/context/auth-context';

function mapDocToCapsule(doc: CapsuleDoc & { id: string }): Capsule {
    const openDate = doc.openDate.toDate();
    const now = new Date();

    let status: CapsuleStatus = 'sealed';
    if (now >= openDate) {
        status = 'ready';
    }

    let recipient = 'Public';
    if (doc.visibility === 'private' && doc.recipientEmail) {
        recipient = doc.recipientEmail;
    } else if (doc.visibility === 'private') {
        recipient = 'You';
    }
    
    return {
        id: doc.id,
        title: doc.title,
        openDate: openDate,
        recipient: recipient,
        status: status,
    };
}


export default function DashboardPage() {
    const { user } = useAuth();
    const [capsules, setCapsules] = useState<Capsule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCapsules() {
            if (user) {
                setIsLoading(true);
                const capsuleDocs = await getCapsulesForUser(user.uid);
                setCapsules(capsuleDocs.map(mapDocToCapsule));
                setIsLoading(false);
            }
        }
        fetchCapsules();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="size-12 animate-spin text-primary" />
            </div>
        )
    }

    const upcomingCapsules = capsules.filter(c => c.status === 'sealed');
    const readyCapsules = capsules.filter(c => c.status === 'ready');
    const archivedCapsules = capsules.filter(c => c.status === 'opened' || c.status === 'expired');

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Your personal time-traveling message hub.</p>
            </div>
            <Button asChild>
            <Link href="/create">
                <PlusCircle />
                Create New Capsule
            </Link>
            </Button>
        </header>

        <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:w-auto sm:grid-cols-3">
            <TabsTrigger value="upcoming"><Clock className="mr-2" /> Upcoming</TabsTrigger>
            <TabsTrigger value="ready"><Gift className="mr-2" /> Ready to Unseal</TabsTrigger>
            <TabsTrigger value="archived"><Archive className="mr-2"/> Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-6">
                <CapsuleList capsules={upcomingCapsules} emptyMessage="No upcoming capsules sealed." />
            </TabsContent>
            <TabsContent value="ready" className="mt-6">
                <CapsuleList capsules={readyCapsules} emptyMessage="No capsules are ready to be unsealed right now." />
            </TabsContent>
            <TabsContent value="archived" className="mt-6">
                <CapsuleList capsules={archivedCapsules} emptyMessage="You have no archived capsules." />
            </TabsContent>
        </Tabs>
        </div>
    );
}
