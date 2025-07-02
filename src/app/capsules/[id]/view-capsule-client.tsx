"use client";

import { useState, useEffect, useMemo } from 'react';
import { SerializableCapsuleDoc } from '@/types/capsule';
import { decryptMessage, importKeyFromString } from '@/lib/crypto';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, AlertTriangle, KeyRound, Unlock } from 'lucide-react';

enum ViewState {
  LOADING,
  LOCKED,
  DECRYPTING,
  UNSEALED,
  MISSING_KEY,
  DECRYPTION_FAILED,
  ERROR
}

function Countdown({ openDate }: { openDate: Date }) {
    const [timeLeft, setTimeLeft] = useState(formatDistanceToNowStrict(openDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(formatDistanceToNowStrict(openDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [openDate]);

    return <span className="font-mono">{timeLeft}</span>;
}


export default function ViewCapsuleClient({ capsuleData }: { capsuleData: SerializableCapsuleDoc }) {
    const [viewState, setViewState] = useState<ViewState>(ViewState.LOADING);
    const [decryptedMessage, setDecryptedMessage] = useState('');
    const [keyFromInput, setKeyFromInput] = useState('');

    const openDate = useMemo(() => new Date(capsuleData.openDate), [capsuleData.openDate]);
    const isReadyToOpen = useMemo(() => new Date() >= openDate, [openDate]);
    
    const handleDecrypt = async (keyString: string) => {
        if (!keyString) {
            setViewState(ViewState.MISSING_KEY);
            return;
        }
        
        setViewState(ViewState.DECRYPTING);
        try {
            const key = await importKeyFromString(keyString);
            const message = await decryptMessage(capsuleData.encryptedMessage, capsuleData.iv, key);
            setDecryptedMessage(message);
            setViewState(ViewState.UNSEALED);
        } catch (err) {
            console.error("Decryption failed:", err);
            setViewState(ViewState.DECRYPTION_FAILED);
        }
    };

    useEffect(() => {
        const keyFromHash = window.location.hash.substring(1);
        
        if (!isReadyToOpen) {
            setViewState(ViewState.LOCKED);
            return;
        }

        if (keyFromHash) {
            handleDecrypt(keyFromHash);
        } else {
            setViewState(ViewState.MISSING_KEY);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReadyToOpen]);

    const renderContent = () => {
        switch (viewState) {
            case ViewState.LOADING:
                return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" /></div>;

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

            case ViewState.MISSING_KEY:
                return (
                    <div className="text-center">
                        <KeyRound className="mx-auto size-12 text-destructive mb-4" />
                        <h2 className="text-2xl font-headline">Decryption Key Required</h2>
                        <p className="text-muted-foreground mt-2">A secret key is needed to open this capsule. It's part of the unique link you saved when creating it.</p>
                        <div className="flex gap-2 mt-6">
                            <Input 
                                type="text"
                                placeholder="Paste the secret key here" 
                                value={keyFromInput}
                                onChange={(e) => setKeyFromInput(e.target.value)}
                                className="bg-background/50"
                            />
                            <Button onClick={() => handleDecrypt(keyFromInput)} disabled={!keyFromInput}>
                                <Unlock/> Unlock
                            </Button>
                        </div>
                         <p className="text-xs text-muted-foreground mt-2">The key is the part of the URL after the '#'.</p>
                    </div>
                );

            case ViewState.DECRYPTION_FAILED:
                return (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Decryption Failed</AlertTitle>
                        <AlertDescription>
                            The provided key is incorrect, or the message data is corrupt. Please check your secret link and try again.
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
                return <p>An unexpected error occurred.</p>
        }
    }


    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
             <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{capsuleData.title}</CardTitle>
                    <CardDescription>
                        Capsule sealed on {format(new Date(capsuleData.createdAt), "PPP")}.
                        Scheduled to open on {format(openDate, "PPP")}.
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
