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
import { AlertCircle } from "lucide-react";
import {
  Alert,
  AlertTitle,
} from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const loginSchema = yup.object({
    username: yup.string().required("username can't be empty"),
    password:  yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
})

type LoginFormValues = yup.InferType<typeof loginSchema>;

function Login() {
    const [loginError, setLoginError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<LoginFormValues>({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            username: '',
            password: ''
        }
    });
    const navigate = useNavigate();

    async function onSubmit(data: LoginFormValues) {
        try {
            setLoginError(false);
            setIsLoading(true);
            const response: AxiosResponse<{ token: string }> = await axios.post("/api/auth/login", {
                username: data.username,
                password: data.password
            })
            if (response.data) {
                localStorage.setItem('token', response.data.token);
                setIsLoading(false);
                navigate('/dashboard');
            }
        } catch (error) {
            setLoginError(true);
            setIsLoading(false);
        }
    }


    return (
        <div className={styles.login_container}>
            <div className={styles.righttop_action}>
                <Button variant="ghost" onClick={()=>navigate('/register')}>Register</Button>
            </div>
            <div className={styles.form}>
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Log In to Your Account</h1>
                    <p className="text-sm text-muted-foreground">Enter your username and password below to login your account</p>
                </div>
                <div className={styles.form_field}>
                    {loginError && <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Wrong username or password</AlertTitle>
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
                                            <Input placeholder="username" {...field} />
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
                                            <Input placeholder="password" type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button className={styles.submit_button} type="submit">
                                {isLoading? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>Logging in</span>
                                    </>
                                ) : "Log in"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default Login;