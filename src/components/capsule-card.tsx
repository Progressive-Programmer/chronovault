"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Globe, Gift, Eye, History } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { Capsule } from "@/types/capsule";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const statusConfig = {
    sealed: { label: "Sealed", variant: "secondary", icon: Clock },
    ready: { label: "Ready to Open", variant: "default", icon: Gift },
    opened: { label: "Opened", variant: "outline", icon: Eye },
    expired: { label: "Expired", variant: "destructive", icon: History },
};

const recipientIcons: { [key: string]: React.ElementType } = {
  'Public': Globe,
  'default': User,
};

export function CapsuleCard({ capsule }: { capsule: Capsule }) {
    const { id, title, openDate, recipient, status } = capsule;
    const { label, variant, icon: StatusIcon } = statusConfig[status];
    const RecipientIcon = recipient.toLowerCase() === 'public' ? recipientIcons.Public : recipientIcons.default;
    
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant={status === 'ready' ? 'default' : 'outline'} disabled={status === 'sealed'}>
                        <Link href={`/capsules/${id}`}>
                            {status === 'ready' && "Unseal Capsule"}
                            {status === 'opened' && "View Content"}
                            {status === 'sealed' && "Sealed"}
                            {status === 'expired' && "Expired"}
                        </Link>
                    </Button>
                  </TooltipTrigger>
                  {(status === 'ready' || status === 'opened') && (
                    <TooltipContent>
                        <p>You can now view this capsule.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
