import { CreateCapsuleForm } from "./create-capsule-form";

export default function CreateCapsulePage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Create a New Time Capsule</h1>
        <p className="text-muted-foreground mt-2">
          Craft a message for the future. Seal it, set a date, and let time do the rest.
        </p>
      </header>
      <CreateCapsuleForm />
    </div>
  );
}
