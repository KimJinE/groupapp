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
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import moment from "moment";
import { Loader2 } from "lucide-react";

const securirySchema = yup.object({
    password:  yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
    retype:  yup
    .string()
    .oneOf([yup.ref('password')], "Passwords must match")
    .required("Please confirm your password"),
});

type SecurityFormValues = yup.InferType<typeof securirySchema>;

function Security() {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const usercontext = useContext(UserContext);
    const user = usercontext?.user;
    const navigate = useNavigate();


    const form = useForm<SecurityFormValues>({
        resolver: yupResolver(securirySchema),
        defaultValues: {
            password: "",
            retype: ""
        }
    });

    useEffect(()=>{
        form.reset({
            password: "",
            retype: ""
        });
    },[user])

    function handleCancel() {
        form.reset();
        setIsEdit(false);
    }

    async function onSubmit(value: SecurityFormValues) {
        const token = localStorage.getItem("token");
        try {
            setIsLoading(true);
            const response = await axios.post("/api/user/update", {
                password: value.password,
            } , {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            if ('message' in response.data) {
                setIsLoading(false);
                localStorage.removeItem("token");
                navigate("/auth/login");
                toast(response.data.message, {
                    description: moment().format("dddd, MMMM DD, YYYY [at] h:mm A")
                })
            } else {
                usercontext?.setUser(response.data);
                setIsEdit(false);
            }
        } catch (e) {
            setIsLoading(false);
            localStorage.removeItem("token");
        }
    }
    return (
        <div className="flex-1 lg:max-w-2xl">
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className={styles.profile_header}>
                        <div>
                            <h3 className="text-lg font-medium">Security</h3>
                            <p className="text-sm text-muted-foreground">
                                you can reset your password
                            </p>
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
                                <Button variant="secondary" type="button" onClick={()=>setIsEdit(true)}>Reset Password</Button>
                            )}
                        </div>
                    </div>
                    <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full"></div>
                    <div className="space-y-8">
                        {isEdit && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="">
                                                Password
                                            </FormLabel>
                                            <FormControl className="">
                                                <Input placeholder="password" type="password" {...field} />
                                            </FormControl>
                                            <FormMessage className=""/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="retype"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="">
                                                Re-type Password
                                            </FormLabel>
                                            <FormControl className="">
                                                <Input placeholder="Re-type" type="password" {...field} />
                                            </FormControl>
                                            <FormMessage className=""/>
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default Security;