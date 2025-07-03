import type { Timestamp } from "firebase/firestore";

export type CapsuleStatus = 'sealed' | 'ready' | 'opened' | 'expired';
export type CapsuleVisibility = 'private-self' | 'private-recipient' | 'public';


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
  userId: string; // The creator of the capsule
  title: string;
  openDate: Timestamp;
  visibility: CapsuleVisibility;
  status: CapsuleStatus;
  createdAt: Timestamp;

  // The recipient's email. For 'private-self', this will be the creator's email.
  recipientEmail?: string; 
  // For 'private-recipient', this will be the recipient's UID.
  recipientId?: string; 

  // Encryption materials
  messageIV: string; // IV for the message itself
  encryptedMessage: string; // Base64 encoded encrypted message data
  
  // For 'private-self' capsules, the key is wrapped with the user's master key
  wrappedKey?: string; // The message key, encrypted
  keyIV?: string; // The IV for the key encryption

  // For 'public' and 'private-recipient' capsules, the key is stored (protected by Firestore rules)
  key?: string; 
};

// This type is used for passing capsule data from Server Components to Client Components,
// as Timestamps are not serializable.
export type SerializableCapsuleDoc = Omit<CapsuleDoc, 'openDate' | 'createdAt'> & {
  id: string;
  openDate: string; // ISO date string
  createdAt: string; // ISO date string
};
