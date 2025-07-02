"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { updateUserProfile } from "@/lib/actions";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name cannot be longer than 50 characters.").optional().or(z.literal('')),
  email: z.string().email(),
});

export function ProfileForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user, userData, refreshUserData } = useAuth();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: userData?.name || "",
            email: user?.email || "",
        },
    });

    // When userData is loaded, reset the form with the new default values.
    useEffect(() => {
        form.reset({
            name: userData?.name || "",
            email: user?.email || "",
        });
    }, [userData, user, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await updateUserProfile(user.uid, { name: values.name || '' });
            await refreshUserData();
            toast({
                title: "Profile Updated",
                description: "Your display name has been saved.",
            });
        } catch (error) {
            console.error("Profile update failed:", error);
            toast({
                title: "Update Failed",
                description: "An error occurred while updating your profile.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Future Me" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input type="email" {...field} disabled />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                        {isSubmitting && <Loader2 className="animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}
