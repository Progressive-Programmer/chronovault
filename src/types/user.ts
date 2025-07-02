export type UserDoc = {
    uid: string;
    email: string;
    // The salt is a Base64 encoded string
    salt: string;
};
