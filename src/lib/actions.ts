'use server';

import { db } from "@/lib/firebase";
import { CapsuleDoc } from "@/types/capsule";
import { addDoc, collection, getDocs, query, where, getDoc, doc, Timestamp } from "firebase/firestore";

// In a real app, this would come from an authentication session (e.g., Firebase Auth, NextAuth.js).
const MOCK_USER_ID = "user_anonymous_123";

type CreateCapsuleInput = Omit<CapsuleDoc, 'userId' | 'createdAt' | 'openDate'> & { openDate: Date };

/**
 * Creates a new time capsule document in Firestore.
 */
export async function createCapsule(data: CreateCapsuleInput): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, "capsules"), {
            ...data,
            userId: MOCK_USER_ID,
            openDate: Timestamp.fromDate(data.openDate),
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        // In a real app, you'd want more robust error handling and logging.
        throw new Error("Could not create capsule.");
    }
}

/**
 * Fetches all capsules for the mock user.
 */
export async function getCapsulesForUser(): Promise<(CapsuleDoc & { id: string })[]> {
    const q = query(collection(db, "capsules"), where("userId", "==", MOCK_USER_ID));
    const querySnapshot = await getDocs(q);
    const capsules: (CapsuleDoc & { id: string })[] = [];
    querySnapshot.forEach((doc) => {
        capsules.push({ id: doc.id, ...doc.data() as CapsuleDoc });
    });
    // Sort by open date, further in the future first
    capsules.sort((a, b) => b.openDate.toMillis() - a.openDate.toMillis());
    return capsules;
}

/**
 * Fetches a single capsule by its document ID.
 */
export async function getCapsuleById(id: string): Promise<(CapsuleDoc & { id: string }) | null> {
    try {
        const docRef = doc(db, "capsules", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() as CapsuleDoc };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching document: ", error);
        return null;
    }
}
