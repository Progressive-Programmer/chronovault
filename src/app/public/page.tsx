import { getPublicCapsules } from '@/lib/actions';
import { CapsuleList } from '@/components/capsule-list';
import type { Capsule, CapsuleStatus, SerializableCapsuleDoc } from "@/types/capsule";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Globe } from 'lucide-react';

function mapDocToCapsule(doc: SerializableCapsuleDoc): Capsule {
    const openDate = new Date(doc.openDate);
    const now = new Date();

    let status: CapsuleStatus = doc.status || 'sealed';
    if (status === 'sealed' && now >= openDate) {
        status = 'ready';
    }

    // Public capsules are always to 'Public'
    const recipient = 'Public';
    
    return {
        id: doc.id,
        title: doc.title,
        openDate: openDate,
        recipient: recipient,
        status: status,
    };
}


export default async function PublicCapsulesPage() {
    let capsules: Capsule[] = [];
    let error: string | null = null;

    try {
        const publicCapsuleDocs = await getPublicCapsules();
        // The server action already filters for capsules past their open date
        capsules = publicCapsuleDocs.map(mapDocToCapsule);
    } catch (err) {
        console.error(err);
        error = "Could not load public capsules at this time. Please try again later.";
    }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <header className="mb-8 flex items-center gap-4">
        <Globe className="size-10 text-primary" />
        <div>
            <h1 className="text-4xl font-bold font-headline tracking-tight">Public Vault</h1>
            <p className="text-muted-foreground mt-2">
            Explore time capsules that have been unsealed and shared with the world.
            </p>
        </div>
      </header>
      
      {error && (
        <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Capsules</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <CapsuleList 
        capsules={capsules} 
        emptyMessage="No public capsules have been unsealed yet. Check back later!" 
      />
    </div>
  );
}
