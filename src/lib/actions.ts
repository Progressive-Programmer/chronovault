'use server';

import { db } from "@/lib/firebase";
import type { CapsuleDoc, CapsuleStatus, SerializableCapsuleDoc } from "@/types/capsule";
import type { UserDoc } from "@/types/user";
import { addDoc, collection, getDocs, query, where, getDoc, doc, Timestamp, setDoc, updateDoc, orderBy } from "firebase/firestore";

const notConfiguredError = "Firebase is not configured. Please check your .env file.";

/**
 * Creates the user document in Firestore, storing their salt.
 * This is called right after a user signs up.
 */
export async function createUserDocument(uid: string, email: string, salt: string): Promise<void> {
    if (!db) throw new Error(notConfiguredError);
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, { uid, email, salt });
    } catch(e) {
        console.error("Error creating user document: ", e);
        throw new Error("Could not create user document.");
    }
}

/**
 * Fetches the user's document, which contains their salt.
 */
export async function getUserDocument(uid: string): Promise<UserDoc | null> {
    if (!db) throw new Error(notConfiguredError);
    try {
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserDoc;
        }
        return null;
    } catch(e) {
        console.error("Error fetching user document: ", e);
        throw new Error("Could not fetch user document.");
    }
}


// NOTE: This type is now different. It accepts key materials based on visibility.
type CreateCapsuleInput = Omit<CapsuleDoc, 'userId' | 'createdAt' | 'openDate' | 'status'> & { openDate: Date };


/**
 * Creates a new time capsule document in Firestore.
 */
export async function createCapsule(data: CreateCapsuleInput, userId: string): Promise<string> {
    if (!db) throw new Error(notConfiguredError);
    try {
        const docRef = await addDoc(collection(db, "capsules"), {
            ...data,
            userId: userId,
            status: 'sealed',
            openDate: Timestamp.fromDate(data.openDate),
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Could not create capsule.");
    }
}

/**
 * Updates the status of a capsule.
 */
export async function updateCapsuleStatus(capsuleId: string, status: CapsuleStatus): Promise<void> {
    if (!db) throw new Error(notConfiguredError);
    try {
        const capsuleRef = doc(db, "capsules", capsuleId);
        await updateDoc(capsuleRef, { status });
    } catch (e) {
        // This is a non-critical background update. Log the error but don't throw,
        // as the user has already seen their message.
        console.error("Error updating capsule status: ", e);
    }
}

/**
 * Fetches all capsules for a given user.
 */
export async function getCapsulesForUser(userId: string): Promise<SerializableCapsuleDoc[]> {
    if (!db) throw new Error(notConfiguredError);
    try {
        // Remove orderBy to prevent needing a composite index which can cause errors on new setups.
        const q = query(collection(db, "capsules"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const capsules: SerializableCapsuleDoc[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as CapsuleDoc;
            const { openDate, createdAt, ...rest } = data;
            capsules.push({
                id: doc.id,
                ...rest,
                openDate: openDate.toDate().toISOString(),
                createdAt: createdAt.toDate().toISOString(),
            });
        });

        // Sort the results in the action itself.
        capsules.sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime());

        return capsules;
    } catch (e) {
        console.error("Error fetching user capsules: ", e);
        throw new Error("Could not fetch user capsules.");
    }
}

/**
 * Fetches all public capsules that are past their opening date.
 */
export async function getPublicCapsules(): Promise<SerializableCapsuleDoc[]> {
    if (!db) throw new Error(notConfiguredError);
    try {
        const q = query(
            collection(db, "capsules"),
            where("visibility", "==", "public"),
            where("openDate", "<=", Timestamp.now()),
            orderBy("openDate", "desc")
        );
        const querySnapshot = await getDocs(q);
        const capsules: SerializableCapsuleDoc[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as CapsuleDoc;
            const { openDate, createdAt, ...rest } = data;
            capsules.push({
                id: doc.id,
                ...rest,
                openDate: openDate.toDate().toISOString(),
                createdAt: createdAt.toDate().toISOString(),
            });
        });
        return capsules;
    } catch (e) {
        console.error("Error fetching public capsules: ", e);
        throw new Error("Could not fetch public capsules. You may need to create a composite index in Firestore.");
    }
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
        throw new Error("Could not fetch capsule.");
    }
}
