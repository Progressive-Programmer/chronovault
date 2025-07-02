"use client";

import { useState, useEffect, useMemo } from 'react';
import { SerializableCapsuleDoc } from '@/types/capsule';
import { decryptMessage, deriveMasterKey, unwrapKey, importKeyFromString } from '@/lib/crypto';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lock, AlertTriangle, Unlock } from 'lucide-react';

// For demonstration purposes, we're using a hardcoded password and salt.
// In a real app, the user would enter their password upon login, and the salt
// would be fetched from their user profile in the database.
const MOCK_USER_PASSWORD = "my-super-secret-password-123";
const MOCK_USER_SALT = "AAECAwQFBgcICQoLDA0ODw=="; // A Base64 encoded 16-byte salt.

enum ViewState {
  LOADING,
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
    const [viewState, setViewState] = useState<ViewState>(ViewState.LOADING);
    const [decryptedMessage, setDecryptedMessage] = useState('');

    const openDate = useMemo(() => new Date(capsuleData.openDate), [capsuleData.openDate]);
    const isReadyToOpen = useMemo(() => new Date() >= openDate, [openDate]);
    
    useEffect(() => {
        const handleDecrypt = async () => {
            setViewState(ViewState.DECRYPTING);
            try {
                let messageKey: CryptoKey;

                if (capsuleData.visibility === 'private') {
                    if (!capsuleData.wrappedKey || !capsuleData.keyIV) {
                        throw new Error("Missing key material for private capsule.");
                    }
                    // 1. Derive master key from password
                    const masterKey = await deriveMasterKey(MOCK_USER_PASSWORD, MOCK_USER_SALT);
                    // 2. Unwrap the message key
                    messageKey = await unwrapKey(capsuleData.wrappedKey, capsuleData.keyIV, masterKey);
                } else { // public
                    if (!capsuleData.key) {
                        throw new Error("Missing key for public capsule.");
                    }
                    // For public capsules, the key is stored directly.
                    messageKey = await importKeyFromString(capsuleData.key);
                }
                
                // 3. Decrypt the message
                const message = await decryptMessage(capsuleData.encryptedMessage, capsuleData.messageIV, messageKey);
                setDecryptedMessage(message);
                setViewState(ViewState.UNSEALED);

            } catch (err) {
                console.error("Decryption failed:", err);
                setViewState(ViewState.DECRYPTION_FAILED);
            }
        };

        if (!isReadyToOpen) {
            setViewState(ViewState.LOCKED);
            return;
        }

        handleDecrypt();

    }, [isReadyToOpen, capsuleData]);

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

            case ViewState.DECRYPTION_FAILED:
                return (
                     <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Decryption Failed</AlertTitle>
                        <AlertDescription>
                            We couldn't decrypt this message. This can happen if the data is corrupt or if there's an issue with the encryption key. In a real app with user accounts, this might mean an incorrect password was used.
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
                            Something went wrong while trying to display this capsule. Please try again later.
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
