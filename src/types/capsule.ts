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
  createdAt: Timestamp;

  // Encryption materials
  messageIV: string; // IV for the message itself
  encryptedMessage: string; // Base64 encoded encrypted message data
  
  // For 'private' capsules, the key is wrapped with the user's master key
  wrappedKey?: string; // The message key, encrypted
  keyIV?: string; // The IV for the key encryption

  // For 'public' capsules, the key is stored in plaintext (but protected by Firestore rules until open)
  key?: string; 
};

// This type is used for passing capsule data from Server Components to Client Components,
// as Timestamps are not serializable.
export type SerializableCapsuleDoc = Omit<CapsuleDoc, 'openDate' | 'createdAt'> & {
  id: string;
  openDate: string; // ISO date string
  createdAt: string; // ISO date string
};
