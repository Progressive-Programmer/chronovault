import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Button,
  Tailwind
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
        <Body className="bg-gray-100 font-sans">
            <Container className="bg-white border border-gray-200 rounded-lg shadow-sm my-10 mx-auto p-8 max-w-xl">
                <Heading className="text-2xl font-bold text-gray-800">ChronoVault</Heading>
                <Heading className="text-xl font-semibold text-gray-700 mt-6">You've Received a Time Capsule!</Heading>
                <Text className="text-base text-gray-600 leading-6">
                    Hello,
                </Text>
                <Text className="text-base text-gray-600 leading-6">
                    A time capsule titled "<strong>{capsuleTitle}</strong>" has been sealed and sent to you through ChronoVault.
                </Text>
                <Text className="text-base text-gray-600 leading-6">
                    It is scheduled to be opened on a future date. When it's ready, you'll be able to access it through your ChronoVault dashboard.
                </Text>
                <Button 
                    href="https://chronovault-app.web.app/login"
                    className="bg-[#3F51B5] text-white font-semibold rounded-md px-6 py-3 mt-6"
                >
                    Visit Your Dashboard
                </Button>
                <Text className="text-sm text-gray-500 mt-8">
                    If you don't have an account yet, you can sign up with this email address ({recipientEmail}) to be ready for the big day.
                </Text>
                <Text className="text-sm text-gray-500">
                    — The ChronoVault Team
                </Text>
            </Container>
        </Body>
    </Tailwind>
  </Html>
);
