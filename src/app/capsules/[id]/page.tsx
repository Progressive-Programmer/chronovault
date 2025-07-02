import { getCapsuleById } from '@/lib/actions';
import { notFound } from 'next/navigation';
import ViewCapsuleClient from './view-capsule-client';
import type { SerializableCapsuleDoc } from '@/types/capsule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default async function ViewCapsulePage({ params }: { params: { id: string } }) {
    if (!params.id) {
        notFound();
    }

    const capsule = await getCapsuleById(params.id);

    if (!capsule) {
        return (
            <div className="container mx-auto max-w-2xl py-12 text-center">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Capsule Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The time capsule you are looking for does not exist or may have been deleted.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Convert Timestamps to a format that can be passed from Server to Client Components.
    const serializableCapsule: SerializableCapsuleDoc = {
        ...capsule,
        openDate: capsule.openDate.toDate().toISOString(),
        createdAt: capsule.createdAt.toDate().toISOString(),
    };

    return <ViewCapsuleClient capsuleData={serializableCapsule} />;
}
