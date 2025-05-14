import { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { UserContext } from "../MainPage";
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
import { Label } from "@/components/ui/label";
import { InfoIcon } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";
import { Loader2 } from "lucide-react";

const profileSchema = yup.object({
    displayName: yup.string().default(''),
});

type ProfileFormValues = yup.InferType<typeof profileSchema>;

function ProfileOverview() {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const usercontext = useContext(UserContext);
    const user = usercontext?.user;

    const form = useForm<ProfileFormValues>({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            displayName: user?.displayName || "",
        }
    });

    useEffect(()=>{
        form.reset({
            displayName: user?.displayName || "",
        });
    },[user])

    const values = form.getValues();

    function handleCancel() {
        form.reset();
        setIsEdit(false);
    }

    async function onSubmit(value: ProfileFormValues) {
        const token = localStorage.getItem("token");
        try {
            setIsLoading(true);
            const response = await axios.post("api/user/update", {
                displayName: value.displayName,
            } , {
                headers: {
                    Authorization: `Bearer ${token}`,
                    }
            })
            usercontext?.setUser(response.data);
            setIsLoading(false);
            setIsEdit(false);
        } catch (e) {
            localStorage.removeItem("token");
            setIsLoading(false);
        }
    }
    return (
        <div className="flex-1 lg:max-w-2xl">
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className={styles.profile_header}>
                        <div>
                            <h3 className="text-lg font-medium">Profile</h3>
                            <p className="text-sm text-muted-foreground">This is how others will see you on the site.</p>
                        </div>
                        <div className={styles.action_bar}>
                            {isEdit?(
                                <>
                                    <Button type="button" onClick={handleCancel} variant="secondary">Cancel</Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                <span>Saving</span>
                                            </>
                                        ) : "Save"}
                                    </Button>
                                </>
                            ):(
                                <Button variant="secondary" type="button" onClick={()=>setIsEdit(true)}>Edit</Button>
                            )}
                        </div>
                    </div>
                    <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full"></div>
                    <div className="space-y-8">
                        {isEdit ? (
                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel className="">
                                            Display Name
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger><InfoIcon size={18}/></TooltipTrigger>
                                                    <TooltipContent>
                                                    <p>Will display username when this is empty</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </FormLabel>
                                        <FormControl className="">
                                            <Input placeholder="Display Name" {...field} />
                                        </FormControl>
                                        <FormMessage className=""/>
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div className="space-y-2">
                                <Label>Display Name</Label>
                                <p className={styles.field_value}>{values.displayName?.trim() || "--"}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Time Zone</Label>
                            <p className={styles.field_value}>{user?.timezone || "--"}</p>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default ProfileOverview;