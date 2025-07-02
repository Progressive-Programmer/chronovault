"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Paperclip,
  Loader2,
  MapPin,
  Lightbulb,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { suggestCapsuleLocation, SuggestCapsuleLocationOutput } from "@/ai/flows/capsule-location-suggestor";
import { useToast } from "@/hooks/use-toast";
import { createCapsule } from "@/lib/actions";
import { generateMessageKey, encryptMessage, wrapKey, exportKeyToString } from "@/lib/crypto";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long.").max(100),
  message: z.string().min(20, "Your message is too short! Add a bit more detail."),
  visibility: z.enum(["private", "public"], {
    required_error: "You need to select a visibility setting.",
  }),
  recipientEmail: z.string().email("Please enter a valid email address.").optional().or(z.literal('')),
  openDate: z.date({
    required_error: "An opening date is required.",
  }),
}).refine(data => {
    // For this simplified app, private capsules are for the user themselves, so no recipient email is needed.
    // In a real app, you would check for a recipient email if sending to others.
    return true;
});


export function CreateCapsuleForm() {
  const [aiSuggestion, setAiSuggestion] = useState<SuggestCapsuleLocationOutput | null>(null);
  const [isSuggestingLocation, setIsSuggestingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();
  const { user, masterKey } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      visibility: "private",
      recipientEmail: "",
    },
  });

  async function handleSuggestLocation() {
    const messageContent = form.getValues("message");
    if (!messageContent || messageContent.length < 20) {
      toast({
        title: "Message too short",
        description: "Please write a longer message before suggesting a location.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSuggestingLocation(true);
    setAiSuggestion(null);
    try {
      const result = await suggestCapsuleLocation({ messageContent });
      setAiSuggestion(result);
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({
        title: "AI Suggestion Failed",
        description: "Could not get a suggestion at this time. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSuggestingLocation(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || (!masterKey && values.visibility === 'private')) {
        toast({ title: "Authentication Error", description: "You must be logged in and have a master key available to create a private capsule.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      const messageKey = await generateMessageKey();
      const { iv: messageIV, encrypted: encryptedMessage } = await encryptMessage(values.message, messageKey);

      let capsuleData: any = {
        title: values.title,
        openDate: values.openDate,
        visibility: values.visibility,
        recipientEmail: user.email, // Private capsules are to self in this version
        messageIV,
        encryptedMessage,
      };

      if (values.visibility === 'private') {
        if (!masterKey) throw new Error("Master key is not available.");
        const { iv: keyIV, wrappedKey } = await wrapKey(messageKey, masterKey);
        capsuleData.keyIV = keyIV;
        capsuleData.wrappedKey = wrappedKey;
      } else {
        capsuleData.key = await exportKeyToString(messageKey);
      }

      await createCapsule(capsuleData, user.uid);

      setShowSuccessModal(true);
      form.reset();
      setAiSuggestion(null);

    } catch (error) {
      console.error("Failed to create capsule:", error);
      toast({
        title: "Creation Failed",
        description: "Something went wrong while sealing your capsule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleSuccess = () => {
    setShowSuccessModal(false);
    router.push('/dashboard');
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Capsule Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capsule Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A Letter to My Future Self" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Message for the Future (Encrypted)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts, stories, and dreams..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      Your message is end-to-end encrypted. No one, not even us, can read it.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="button" variant="outline" className="w-full sm:w-auto" disabled>
                  <Paperclip className="mr-2" /> Attach Files (Coming Soon)
                </Button>
                <Button type="button" variant="outline" onClick={handleSuggestLocation} disabled={isSuggestingLocation} className="w-full sm:w-auto">
                  {isSuggestingLocation ? (
                    <Loader2 className="mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 text-accent" />
                  )}
                  Suggest Opening Location
                </Button>
              </div>
              
              {isSuggestingLocation && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 animate-spin" />Thinking of the perfect spot...</div>}
              
              {aiSuggestion && (
                <Alert className="bg-accent/10 border-accent/50">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  <AlertTitle className="font-headline text-accent flex items-center gap-2"><MapPin/> AI Location Suggestion</AlertTitle>
                  <AlertDescription>
                    <p className="font-semibold">{aiSuggestion.suggestedLocation}</p>
                    <p className="text-muted-foreground mt-1">{aiSuggestion.reasoning}</p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Delivery Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="openDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Opening Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The date when this capsule can be unsealed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Visibility</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="private" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Private (only you can open)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="public" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Public (anyone can view on open date)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  Seal Time Capsule
              </Button>
          </div>
        </form>
      </Form>
      
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Capsule Sealed & Secured!</AlertDialogTitle>
            <AlertDialogDescription>
              Your time capsule is now sealed and securely stored. You can view it from your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccess}>Great!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
