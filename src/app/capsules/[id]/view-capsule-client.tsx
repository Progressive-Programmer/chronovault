"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { SerializableCapsuleDoc } from '@/types/capsule';
import { decryptMessage, unwrapKey, importKeyFromString } from '@/lib/crypto';
import { updateCapsuleStatus } from '@/lib/actions';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lock, AlertTriangle, Eye } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

enum ViewState {
  LOADING_AUTH,
  LOCKED,
  DECRYPTING,
  UNSEALED,
  DECRYPTION_FAILED,
  ERROR
}

function Countdown({ openDate }: { openDate: Date }) {
    const [timeLeft, setTimeLeft] = useState(formatDistanceToNowStrict(openDate));

    useEffect(() => {
        const timer = setInterval(() => {
            if (new Date() < openDate) {
                setTimeLeft(formatDistanceToNowStrict(openDate));
            } else {
                setTimeLeft("Ready to open!");
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [openDate]);

    return <span className="font-mono">{timeLeft}</span>;
}

export default function ViewCapsuleClient({ capsuleData }: { capsuleData: SerializableCapsuleDoc }) {
    const [viewState, setViewState] = useState<ViewState>(ViewState.LOADING_AUTH);
    const [decryptedMessage, setDecryptedMessage] = useState('');
    const { masterKey, user, loading: authLoading } = useAuth();

    const openDate = useMemo(() => new Date(capsuleData.openDate), [capsuleData.openDate]);
    const isReadyToOpen = useMemo(() => new Date() >= openDate, [openDate]);
    
    const handleDecrypt = useCallback(async () => {
        setViewState(ViewState.DECRYPTING);
        try {
            let messageKey: CryptoKey;

            if (capsuleData.visibility === 'private') {
                if (!user) throw new Error("User not logged in for private capsule.");
                if (!masterKey) throw new Error("Master key not available. Please try logging out and back in.");
                if (!capsuleData.wrappedKey || !capsuleData.keyIV) throw new Error("Missing key material for private capsule.");
                
                messageKey = await unwrapKey(capsuleData.wrappedKey, capsuleData.keyIV, masterKey);
            } else { // public
                if (!capsuleData.key) throw new Error("Missing key for public capsule.");
                
                messageKey = await importKeyFromString(capsuleData.key);
            }
            
            const message = await decryptMessage(capsuleData.encryptedMessage, capsuleData.messageIV, messageKey);
            setDecryptedMessage(message);
            setViewState(ViewState.UNSEALED);

            if (capsuleData.status !== 'opened') {
                await updateCapsuleStatus(capsuleData.id, 'opened');
            }

        } catch (err) {
            console.error("Decryption failed:", err);
            setViewState(ViewState.DECRYPTION_FAILED);
        }
    }, [capsuleData, masterKey, user]);


    useEffect(() => {
        if (authLoading) {
            setViewState(ViewState.LOADING_AUTH);
            return;
        }

        if (!isReadyToOpen) {
            setViewState(ViewState.LOCKED);
            return;
        }

        // At this point, it's ready to open. We need to decide if we can decrypt.
        if (capsuleData.visibility === 'private') {
            // For private capsules, we must have a user and a master key.
            if (user && masterKey) {
                handleDecrypt();
            } else {
                // If we have a user but no key, or no user at all, decryption is impossible.
                setViewState(ViewState.DECRYPTION_FAILED);
            }
        } else {
            // Public capsules can be decrypted by anyone.
            handleDecrypt();
        }

    }, [isReadyToOpen, capsuleData, masterKey, user, authLoading, handleDecrypt]);

    const renderContent = () => {
        switch (viewState) {
            case ViewState.LOADING_AUTH:
                return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" /> <span className="ml-2">Verifying credentials...</span></div>;

            case ViewState.LOCKED:
                return (
                    <div className="text-center">
                        <Lock className="mx-auto size-12 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-headline">This capsule is still sealed.</h2>
                        <p className="text-muted-foreground mt-2">It can be opened in approximately:</p>
                        <p className="text-3xl font-bold mt-4"><Countdown openDate={openDate} /></p>
                    </div>
                );
            
            case ViewState.DECRYPTING:
                return (
                    <div className="text-center">
                        <Loader2 className="mx-auto size-12 text-primary animate-spin mb-4" />
                        <h2 className="text-2xl font-headline">Unsealing...</h2>
                        <p className="text-muted-foreground mt-2">Decrypting your message from the past.</p>
                    </div>
                );

            case ViewState.DECRYPTION_FAILED:
                return (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Decryption Failed</AlertTitle>
                        <AlertDescription>
                            We couldn&apos;t decrypt this message. This can happen if the data is corrupt or the encryption key is missing. For private capsules, your session may have expired; please try logging out and back in.
                        </AlertDescription>
                    </Alert>
                );

            case ViewState.UNSEALED:
                return (
                    <div className="whitespace-pre-wrap font-body text-lg leading-relaxed bg-background/50 p-6 rounded-md border">
                        {decryptedMessage}
                    </div>
                );

            default:
                 return (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>An Unexpected Error Occurred</AlertTitle>
                        <AlertDescription>
                            Something went wrong while trying to display this capsule. You may need to log in again.
                        </AlertDescription>
                    </Alert>
                );
        }
    }

    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
             <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{capsuleData.title}</CardTitle>
                    <CardDescription>
                        Capsule sealed on {format(new Date(capsuleData.createdAt), "PPP")}.
                        {capsuleData.status === 'opened' ? (
                            <span className="flex items-center gap-2"> <Eye className="size-4" /> Opened on {format(openDate, "PPP")}.</span>
                        ) : (
                            <span> Scheduled to open on {format(openDate, "PPP")}.</span>
                        )}
                        
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
                {viewState === ViewState.UNSEALED && (
                    <CardFooter>
                         <p className="text-xs text-muted-foreground">Message decrypted successfully in your browser.</p>
                    </CardFooter>
                )}
             </Card>
        </div>
    );
}
