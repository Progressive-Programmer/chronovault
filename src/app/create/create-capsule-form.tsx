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
  Copy,
  Check,
} from "lucide-react";

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
import { generateKey, encryptMessage, exportKeyToString } from "@/lib/crypto";

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
    if (data.visibility === 'private') {
        return !!data.recipientEmail;
    }
    return true;
}, {
    message: "Recipient email is required for private capsules.",
    path: ["recipientEmail"],
});


export function CreateCapsuleForm() {
  const [aiSuggestion, setAiSuggestion] = useState<SuggestCapsuleLocationOutput | null>(null);
  const [isSuggestingLocation, setIsSuggestingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

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
    setIsSubmitting(true);
    try {
      // 1. Generate encryption key
      const key = await generateKey();
      
      // 2. Encrypt the message
      const { iv, encrypted } = await encryptMessage(values.message, key);

      // 3. Prepare data for Firestore
      const capsuleData = {
        title: values.title,
        openDate: values.openDate,
        visibility: values.visibility,
        recipientEmail: values.recipientEmail || "",
        encryptedMessage: encrypted,
        iv: iv,
      };

      // 4. Save to Firestore via Server Action
      const capsuleId = await createCapsule(capsuleData);

      // 5. Generate the secret link
      const keyString = await exportKeyToString(key);
      const link = `${window.location.origin}/capsules/${capsuleId}#${keyString}`;
      setGeneratedLink(link);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                      Your message will be end-to-end encrypted. Only the person with the secret link can read it.
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
                            Private (requires recipient's email)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="public" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Public (anyone with the link can view on open date)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("visibility") === 'private' && (
                  <FormField
                  control={form.control}
                  name="recipientEmail"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Recipient's Email</FormLabel>
                      <FormControl>
                          <Input placeholder="friend@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
                  />
              )}
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
              Your time capsule is now sealed. To open it in the future, you MUST use this secret link.
              <span className="font-bold text-destructive"> Save this link somewhere safe. If you lose it, your message cannot be recovered.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="relative rounded-md bg-muted p-4">
              <p className="break-all text-sm text-muted-foreground">{generatedLink}</p>
              <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy}>
                {copied ? <Check className="text-green-500" /> : <Copy />}
              </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessModal(false)}>I have saved the link</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
