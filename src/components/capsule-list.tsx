import type { Capsule } from "@/types/capsule";
import { CapsuleCard } from "./capsule-card";

interface CapsuleListProps {
    capsules: Capsule[];
    emptyMessage: string;
}

export function CapsuleList({ capsules, emptyMessage }: CapsuleListProps) {
    return (
        <div className="relative flex flex-col gap-8 before:absolute before:left-4 before:top-4 before:h-full before:w-px before:bg-border">
            {capsules.length > 0 ? (
                capsules.map(capsule => <CapsuleCard key={capsule.id} capsule={capsule} />)
            ) : (
                <p className="text-muted-foreground pl-12">{emptyMessage}</p>
            )}
        </div>
    )
}
