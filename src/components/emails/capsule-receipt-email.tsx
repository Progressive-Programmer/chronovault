import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Tailwind,
  Section,
} from '@react-email/components';

interface CapsuleReceiptEmailProps {
  recipientEmail: string;
  capsuleTitle: string;
}

export const CapsuleReceiptEmail: React.FC<Readonly<CapsuleReceiptEmailProps>> = ({
  recipientEmail,
  capsuleTitle,
}) => (
  <Html>
    <Head />
    <Tailwind>
        <Body className="bg-gray-100 font-sans text-gray-800">
            <Container className="bg-white border border-gray-200 rounded-lg shadow-sm my-10 mx-auto p-8 max-w-xl">
                
                <Section className="text-center mb-8">
                   <Text className="text-3xl font-bold font-headline text-primary">ChronoVault</Text>
                   <Text className="text-sm text-muted-foreground">A Message Sealed in Time</Text>
                </Section>
                
                <Heading className="text-2xl font-semibold text-center mt-6">A Message From the Past Awaits You!</Heading>
                
                <Text className="text-base text-gray-600 leading-relaxed mt-6">
                    Hello,
                </Text>
                
                <Text className="text-base text-gray-600 leading-relaxed">
                    Someone has sent you a digital time capsule named <strong>&quot;{capsuleTitle}&quot;</strong>. They've sealed a memory, a thought, or a dream, meant only for your eyes on a specific day in the future.
                </Text>

                <Text className="text-base text-gray-600 leading-relaxed mt-4">
                    <strong>What is ChronoVault?</strong> It's a place to preserve today's moments for tomorrow. It's about connection, patience, and the magic of rediscovery.
                </Text>

                <Section className="text-center mt-8 mb-8">
                  <Button 
                      href={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login`}
                      className="bg-primary text-primary-foreground font-semibold rounded-md px-6 py-3"
                  >
                      Prepare for the Future
                  </Button>
                </Section>

                <Text className="text-sm text-gray-500 leading-relaxed">
                    To read your message when it's unsealed, simply create a free ChronoVault account using this email address: <strong>{recipientEmail}</strong>. Your capsule will be waiting for you safely in your vault.
                </Text>
                
                <Section className="mt-8 border-t border-gray-200 pt-6 text-center">
                    <Text className="text-xs text-gray-400">
                        This message is a bridge through time.
                    </Text>
                     <Text className="text-xs text-gray-400">
                        The Keepers of Time at ChronoVault
                    </Text>
                </Section>

            </Container>
        </Body>
    </Tailwind>
  </Html>
);