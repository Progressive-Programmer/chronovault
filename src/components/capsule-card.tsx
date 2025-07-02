"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Globe, Users, Gift, Eye, History } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type Capsule = {
  id: string;
  title: string;
  openDate: Date;
  recipient: string;
  status: 'sealed' | 'ready' | 'opened' | 'expired';
};

const statusConfig = {
    sealed: { label: "Sealed", variant: "secondary", icon: Clock },
    ready: { label: "Ready to Open", variant: "default", icon: Gift },
    opened: { label: "Opened", variant: "outline", icon: Eye },
    expired: { label: "Expired", variant: "destructive", icon: History },
};

const recipientIcons: { [key: string]: React.ElementType } = {
  'Yourself': User,
  'Public': Globe,
  'default': Users,
};

export function CapsuleCard({ capsule }: { capsule: Capsule }) {
    const { title, openDate, recipient, status } = capsule;
    const { label, variant, icon: StatusIcon } = statusConfig[status];
    const RecipientIcon = recipientIcons[recipient] || recipientIcons.default;
    
    const isPast = new Date() > openDate;
    const dateText = isPast
      ? `${formatDistanceToNow(openDate)} ago`
      : `in ${formatDistanceToNow(openDate)}`;

  return (
    <div className="flex items-start gap-4 pl-12">
      <div className="relative">
          <div className="absolute -left-8 top-1.5 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
             <StatusIcon className="size-4" />
          </div>
      </div>
      <Card className="w-full transition-all hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={variant as any}>{label}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <RecipientIcon className="size-3.5" />
                    <span>To: {recipient}</span>
                </div>
              </div>
              <h3 className="font-semibold font-headline text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {isPast ? "Opened on" : "Opens on"} {format(openDate, "MMMM d, yyyy")} ({dateText})
              </p>
            </div>
            <div className="flex items-center shrink-0">
               {status === 'ready' && <Button>Unseal Capsule</Button>}
               {status === 'opened' && <Button variant="outline">View Content</Button>}
               {status === 'sealed' && <Button variant="outline" disabled>Sealed</Button>}
               {status === 'expired' && <Button variant="ghost" disabled>Expired</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
