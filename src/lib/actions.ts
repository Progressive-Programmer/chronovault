'use server';

import { db } from "@/lib/firebase";
import type { CapsuleDoc } from "@/types/capsule";
import type { UserDoc } from "@/types/user";
import { addDoc, collection, getDocs, query, where, getDoc, doc, Timestamp, setDoc } from "firebase/firestore";

const notConfiguredError = "Firebase is not configured. Please check your .env file.";

/**
 * Creates the user document in Firestore, storing their salt.
 * This is called right after a user signs up.
 */
export async function createUserDocument(uid: string, email: string, salt: string): Promise<void> {
    if (!db) throw new Error(notConfiguredError);
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, { uid, email, salt });
}

/**
 * Fetches the user's document, which contains their salt.
 */
export async function getUserDocument(uid: string): Promise<UserDoc | null> {
    if (!db) throw new Error(notConfiguredError);
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data() as UserDoc;
    }
    return null;
}


// NOTE: This type is now different. It accepts key materials based on visibility.
type CreateCapsuleInput = Omit<CapsuleDoc, 'userId' | 'createdAt' | 'openDate'> & { openDate: Date };


/**
 * Creates a new time capsule document in Firestore.
 */
export async function createCapsule(data: CreateCapsuleInput, userId: string): Promise<string> {
    if (!db) throw new Error(notConfiguredError);
    try {
        const docRef = await addDoc(collection(db, "capsules"), {
            ...data,
            userId: userId,
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
 * Fetches all capsules for a given user.
 */
export async function getCapsulesForUser(userId: string): Promise<(CapsuleDoc & { id: string })[]> {
    if (!db) throw new Error(notConfiguredError);
    const q = query(collection(db, "capsules"), where("userId", "==", userId));
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
    if (!db) throw new Error(notConfiguredError);
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
