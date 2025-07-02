import type { Timestamp } from "firebase/firestore";

export type CapsuleStatus = 'sealed' | 'ready' | 'opened' | 'expired';

// This type is used for UI components like CapsuleCard and CapsuleList.
// It's derived from the Firestore document.
export type Capsule = {
  id: string;
  title: string;
  openDate: Date;
  recipient: string;
  status: CapsuleStatus;
};

// This type represents the data structure stored in a Firestore document.
export type CapsuleDoc = {
  userId: string;
  title: string;
  openDate: Timestamp;
  visibility: 'private' | 'public';
  recipientEmail: string;
  encryptedMessage: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded initialization vector
  createdAt: Timestamp;
};

// This type is used for passing capsule data from Server Components to Client Components,
// as Timestamps are not serializable.
export type SerializableCapsuleDoc = Omit<CapsuleDoc, 'openDate' | 'createdAt'> & {
  id: string;
  openDate: string; // ISO date string
  createdAt: string; // ISO date string
};
