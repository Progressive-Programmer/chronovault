'use server';

import { db } from "@/lib/firebase";
import type { CapsuleDoc, CapsuleStatus, SerializableCapsuleDoc } from "@/types/capsule";
import type { UserDoc } from "@/types/user";
import { addDoc, collection, getDocs, query, where, getDoc, doc, Timestamp, setDoc, updateDoc, orderBy } from "firebase/firestore";

const notConfiguredError = "Firebase is not configured. Please check your .env file.";

/**
 * Creates the user document in Firestore, storing their salt and a default name.
 * This is called right after a user signs up.
 */
export async function createUserDocument(uid: string, email: string, salt: string): Promise<void> {
    if (!db) throw new Error(notConfiguredError);
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, { 
            uid, 
            email, 
            salt,
            name: email.split('@')[0] // Set a default name from the email
        });
    } catch(e) {
        console.error("Error creating user document: ", e);
        throw new Error("Could not create user document.");
    }
}

/**
 * Updates a user's profile information.
 */
export async function updateUserProfile(uid: string, data: { name: string }): Promise<void> {
    if (!db) throw new Error(notConfiguredError);
    try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, data);
    } catch (e) {
        console.error("Error updating user profile: ", e);
        throw new Error("Could not update user profile.");
    }
}

/**
 * Fetches the user's document, which contains their salt and profile info.
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

/**
 * Finds a user by their email address.
 */
export async function getUserByEmail(email: string): Promise<UserDoc | null> {
    if (!db) throw new Error(notConfiguredError);
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return querySnapshot.docs[0].data() as UserDoc;
}


type CreateCapsuleInput = Omit<CapsuleDoc, 'userId' | 'createdAt' | 'openDate' | 'status'> & { openDate: Date };


/**
 * Creates a new time capsule document in Firestore.
 */
export async function createCapsule(data: CreateCapsuleInput, userId: string): Promise<string> {
    if (!db) throw new Error(notConfiguredError);
    try {
        let finalData: any = {
            ...data,
            userId: userId,
            status: 'sealed',
            openDate: Timestamp.fromDate(data.openDate),
            createdAt: Timestamp.now(),
        };

        if (data.visibility === 'private-recipient') {
            if (!data.recipientEmail) throw new Error("Recipient email is required for this capsule type.");
            const recipientUser = await getUserByEmail(data.recipientEmail);
            if (!recipientUser) throw new Error(`No user found with the email: ${data.recipientEmail}. Please ensure they have a ChronoVault account.`);
            finalData.recipientId = recipientUser.uid;
        } else if (data.visibility === 'private-self') {
            finalData.recipientId = userId;
        }

        const docRef = await addDoc(collection(db, "capsules"), finalData);
        return docRef.id;
    } catch (e: any) {
        console.error("Error adding document: ", e);
        throw new Error(e.message || "Could not create capsule.");
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
        console.error("Error updating capsule status: ", e);
    }
}

/**
 * Fetches all capsules for a given user (both created by and sent to them).
 */
export async function getCapsulesForUser(userId: string): Promise<SerializableCapsuleDoc[]> {
    if (!db) throw new Error(notConfiguredError);
    try {
        // Capsules created by the user
        const createdQ = query(collection(db, "capsules"), where("userId", "==", userId));

        // Capsules sent to the user by others
        const receivedQ = query(
            collection(db, "capsules"),
            where("recipientId", "==", userId),
            where("visibility", "==", "private-recipient")
        );

        const [createdSnapshot, receivedSnapshot] = await Promise.all([
            getDocs(createdQ),
            getDocs(receivedQ)
        ]);

        const capsulesMap = new Map<string, SerializableCapsuleDoc>();

        const processSnapshot = (snapshot: any) => {
             snapshot.forEach((doc: any) => {
                const data = doc.data() as CapsuleDoc;
                const { openDate, createdAt, ...rest } = data;
                capsulesMap.set(doc.id, {
                    id: doc.id,
                    ...rest,
                    openDate: openDate.toDate().toISOString(),
                    createdAt: createdAt.toDate().toISOString(),
                });
            });
        };

        processSnapshot(createdSnapshot);
        processSnapshot(receivedSnapshot);

        const capsules = Array.from(capsulesMap.values());
        
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
