import { useState } from "react";
import styles from "./Login.module.scss";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Form,
    FormControl,
    // FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertTitle,
} from "@/components/ui/alert";

const registerSchema = yup.object({
    username: yup.string().required("username can't be empty"),
    password:  yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
    confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], "Passwords must match")
    .required("Please confirm your password"),
    email: yup
    .string()
    .email()
    .required("email is required"),
})

type RegisterFormValues = yup.InferType<typeof registerSchema>;

function Register() {
    const [registerError, setRegisterError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form = useForm<RegisterFormValues>({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
        }
    });
    const navigate = useNavigate();

    async function onSubmit(data: RegisterFormValues) {
        try {
            setRegisterError(false);
            setIsLoading(true)
            const response: AxiosResponse<{ token: string }> = await axios.post("/api/auth/register", {
                username: data.username,
                password: data.password,
                email: data.email
            })
            if (response.data) {
                localStorage.setItem('token', response.data.token);
                navigate('/login');
            }
        } catch (error) {
            setRegisterError(true);
            setIsLoading(false)
        }
    }


    return (
        <div className={styles.login_container}>
            <div className={styles.righttop_action}>
                <Button variant="ghost" onClick={()=>navigate('/login')}>Login</Button>
            </div>
            <div className={styles.form}>
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                    <p className="text-sm text-muted-foreground">Enter your username and password below to create your account</p>
                </div>
                <div className={styles.form_field}>
                    {registerError && <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Username already exist</AlertTitle>
                    </Alert>}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input autoComplete="new-password" placeholder="username" {...field} />
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
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input autoComplete="new-password" type="email" placeholder="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input autoComplete="new-password" placeholder="password" type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input autoComplete="new-password" placeholder="Re-type password" type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button className={styles.submit_button} type="submit">
                                {isLoading? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>Registering</span>
                                    </>
                                ) : "Register"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default Register;