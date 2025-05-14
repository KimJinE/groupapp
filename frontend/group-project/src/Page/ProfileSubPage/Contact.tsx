import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    // FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import styles from "./ProfileSub.module.scss";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea"
import emailjs from "emailjs-com";

const contactSchema = yup.object({
    name:  yup
    .string()
    .required("Your name is required"),
    email:  yup
    .string()
    .email()
    .required("Your email address is required"),
    advice:  yup
    .string()
    .required("Please confirm your comment"),
});

type ContactFormValues = yup.InferType<typeof contactSchema>;

function Contact() {
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const form = useForm<ContactFormValues>({
        resolver: yupResolver(contactSchema),
        defaultValues: {
            name: "",
            email: "",
            advice: ""
        }
    });

    function handleCancel() {
        form.reset();
    }

    async function onSubmit(value: ContactFormValues) {
        setIsLoading(true);
        emailjs.send(
            "service_8meomvk",
            "template_z4ldrsx",
            {
            name: value.name,
            title: "advice for group project",
            reply_to: value.email,
            message: value.advice,
            },
            "vbiwXRgcJ67ap0xRo"
        )
        .then(() => {
            toast.success("Message sent successfully!");
            form.reset();
            setIsLoading(false);
        })
        .catch((err) => {
            console.error("Failed to send message", err);
            toast.error("Failed to send message. Please try again.");
            setIsLoading(false);
        });

    }
    return (
        <div className="flex-1 lg:max-w-2xl">
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className={styles.profile_header}>
                        <div>
                            <h3 className="text-lg font-medium">Contact</h3>
                            <p className="text-sm text-muted-foreground">
                                Please share your feedback with me!
                            </p>
                        </div>
                        <div className={styles.action_bar}>
                            <Button type="button" onClick={handleCancel} variant="secondary">Clear</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Sending</span>
                                </>
                            ) : "Send"}
                            </Button>
                        </div>
                    </div>
                    <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full"></div>
                    <div className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="">
                                        Name
                                    </FormLabel>
                                    <FormControl className="">
                                        <Input placeholder="name" {...field} />
                                    </FormControl>
                                    <FormMessage className=""/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="">
                                        Email
                                    </FormLabel>
                                    <FormControl className="">
                                        <Input placeholder="email" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage className=""/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="advice"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="">
                                        Comment
                                    </FormLabel>
                                    <FormControl className="">
                                        <Textarea placeholder="type your comment here" {...field} />
                                    </FormControl>
                                    <FormMessage className=""/>
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default Contact;