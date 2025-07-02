import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CapsuleList } from "@/components/capsule-list";
import type { Capsule } from "@/types/capsule";
import { PlusCircle, Clock, Gift, Archive } from "lucide-react";
import Link from "next/link";

const upcomingCapsules: Capsule[] = [
  {
    id: '1',
    title: "Message to my future self",
    openDate: new Date('2034-10-27T10:00:00Z'),
    recipient: 'Yourself',
    status: 'sealed',
  },
  {
    id: '2',
    title: "Our 10th Anniversary",
    openDate: new Date('2028-06-15T18:30:00Z'),
    recipient: 'Jane Doe',
    status: 'sealed',
  },
];

const readyCapsules: Capsule[] = [
  {
    id: '3',
    title: "A slice of 2024",
    openDate: new Date('2024-01-01T00:00:00Z'),
    recipient: 'Public',
    status: 'ready',
  },
];

const archivedCapsules: Capsule[] = [
  {
    id: '4',
    title: "University graduation memories",
    openDate: new Date('2020-05-20T12:00:00Z'),
    recipient: 'Group: Friends',
    status: 'opened',
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
