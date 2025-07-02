
"use client";

import { useState, useEffect } from 'react';
import { CapsuleList } from "@/components/capsule-list";
import type { Capsule, CapsuleStatus, SerializableCapsuleDoc } from "@/types/capsule";
import { Globe, Loader2, AlertTriangle } from "lucide-react";
import { getPublicCapsules } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function mapDocToCapsule(doc: SerializableCapsuleDoc): Capsule {
    const openDate = new Date(doc.openDate);
    
    // Public capsules are by definition 'opened' as they are past their open date
    const status: CapsuleStatus = 'opened';
    
    return {
        id: doc.id,
        title: doc.title,
        openDate: openDate,
        recipient: 'Public', // It's a public capsule
        status: status,
    };
}

export default function PublicCapsulesPage() {
    const [capsules, setCapsules] = useState<Capsule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPublicCapsules() {
            setIsLoading(true);
            setError(null);
            try {
                const capsuleDocs = await getPublicCapsules();
                setCapsules(capsuleDocs.map(mapDocToCapsule));
            } catch (err) {
                console.error("Failed to fetch public capsules:", err);
                setError("Could not load public capsules at this time. This may be due to a configuration issue. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchPublicCapsules();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex h-full items-center justify-center p-8">
                    <Loader2 className="size-12 animate-spin text-primary" />
                </div>
            );
        }

        if (error) {
            return (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Capsules</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            );
        }

        return <CapsuleList capsules={capsules} emptyMessage="There are no public capsules to display at this moment." />;
    };

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <header>
                <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
                    <Globe /> Public Vault
                </h1>
                <p className="text-muted-foreground mt-2">
                    A collection of time capsules shared with the world.
                </p>
            </header>
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
}
