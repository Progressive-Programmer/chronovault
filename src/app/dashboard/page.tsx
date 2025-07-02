import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CapsuleCard } from "@/components/capsule-card";
import { PlusCircle, Clock, Gift, Archive } from "lucide-react";
import Link from "next/link";

const upcomingCapsules = [
  {
    id: '1',
    title: "Message to my future self",
    openDate: new Date('2034-10-27T10:00:00Z'),
    recipient: 'Yourself',
    status: 'sealed' as const,
  },
  {
    id: '2',
    title: "Our 10th Anniversary",
    openDate: new Date('2028-06-15T18:30:00Z'),
    recipient: 'Jane Doe',
    status: 'sealed' as const,
  },
];

const readyCapsules = [
  {
    id: '3',
    title: "A slice of 2024",
    openDate: new Date('2024-01-01T00:00:00Z'),
    recipient: 'Public',
    status: 'ready' as const,
  },
];

const archivedCapsules = [
  {
    id: '4',
    title: "University graduation memories",
    openDate: new Date('2020-05-20T12:00:00Z'),
    recipient: 'Group: Friends',
    status: 'opened' as const,
  },
];

export default function DashboardPage() {
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
          <TabsTrigger value="ready"><Gift className="mr-2" /> Ready for Unsealing</TabsTrigger>
          <TabsTrigger value="archived"><Archive className="mr-2"/> Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          <div className="relative flex flex-col gap-8 before:absolute before:left-4 before:top-4 before:h-full before:w-px before:bg-border">
            {upcomingCapsules.length > 0 ? (
              upcomingCapsules.map(capsule => <CapsuleCard key={capsule.id} capsule={capsule} />)
            ) : (
              <p className="text-muted-foreground pl-12">No upcoming capsules sealed.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="ready" className="mt-6">
          <div className="relative flex flex-col gap-8 before:absolute before:left-4 before:top-4 before:h-full before:w-px before:bg-border">
            {readyCapsules.length > 0 ? (
              readyCapsules.map(capsule => <CapsuleCard key={capsule.id} capsule={capsule} />)
            ) : (
              <p className="text-muted-foreground pl-12">No capsules are ready to be unsealed right now.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="archived" className="mt-6">
          <div className="relative flex flex-col gap-8 before:absolute before:left-4 before:top-4 before:h-full before:w-px before:bg-border">
            {archivedCapsules.length > 0 ? (
              archivedCapsules.map(capsule => <CapsuleCard key={capsule.id} capsule={capsule} />)
            ) : (
               <p className="text-muted-foreground pl-12">You have no archived capsules.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
