import { NextResponse, type NextRequest } from 'next/server';
import { Resend } from 'resend';
import { CapsuleReceiptEmail } from '@/components/emails/capsule-receipt-email';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL;

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
     return NextResponse.json({ error: 'RESEND_API_KEY is not configured.' }, { status: 500 });
  }
  if (!fromEmail) {
    return NextResponse.json({ error: 'RESEND_FROM_EMAIL is not configured.' }, { status: 500 });
  }

  try {
    const { recipientEmail, capsuleTitle } = await req.json();

    if (!recipientEmail || !capsuleTitle) {
      return NextResponse.json({ error: 'Missing required fields: recipientEmail and capsuleTitle' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [recipientEmail],
      subject: 'You have a new Time Capsule from ChronoVault!',
      react: CapsuleReceiptEmail({ recipientEmail, capsuleTitle }),
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
