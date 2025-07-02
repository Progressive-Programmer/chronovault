import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CapsuleList } from "@/components/capsule-list";
import type { Capsule, CapsuleDoc, CapsuleStatus } from "@/types/capsule";
import { PlusCircle, Clock, Gift, Archive } from "lucide-react";
import Link from "next/link";
import { getCapsulesForUser } from "@/lib/actions";

function mapDocToCapsule(doc: CapsuleDoc & { id: string }): Capsule {
    const openDate = doc.openDate.toDate();
    const now = new Date();

    let status: CapsuleStatus = 'sealed';
    // In a real app, you would also check a flag in the DB to see if it's been opened.
    if (now >= openDate) {
        status = 'ready';
    }

    let recipient = 'Public';
    if (doc.visibility === 'private' && doc.recipientEmail) {
        recipient = doc.recipientEmail;
    } else if (doc.visibility === 'private') {
        recipient = 'Private';
    }
    
    return {
        id: doc.id,
        title: doc.title,
        openDate: openDate,
        recipient: recipient,
        status: status,
    };
}


export default async function DashboardPage() {
  const capsuleDocs = await getCapsulesForUser();
  const allCapsules = capsuleDocs.map(mapDocToCapsule);

  const upcomingCapsules = allCapsules.filter(c => c.status === 'sealed');
  const readyCapsules = allCapsules.filter(c => c.status === 'ready');
  const archivedCapsules = allCapsules.filter(c => c.status === 'opened' || c.status === 'expired');

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
