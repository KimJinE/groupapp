import React, {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    // FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import axios, { AxiosResponse } from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const createSchema = yup.object({
    groupname: yup.string().required("Group name is required"),
    description: yup.string().default(''),
    requiresApproval: yup.boolean().default(false)
})

type CreateGroupProps = {
    onGroupCreated: (toastMessage: string | null) => void;
};

type CreateFormValues = yup.InferType<typeof createSchema>;

const CreateGroup: React.FC<CreateGroupProps> = ({onGroupCreated}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<CreateFormValues>({
        resolver: yupResolver(createSchema),
        defaultValues: {
            groupname: '',
            description: '',
            requiresApproval: false,
        }
    });

    async function onSubmit(value: CreateFormValues) {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response: AxiosResponse = await axios.post<string>("/api/groups/create", {
                name: value.groupname,
                description: value.description,
                requiresApproval: value.requiresApproval,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.data) {
                setIsLoading(false);
                setOpen(false);
                onGroupCreated(response.data);
            }
        } catch (error) {
            toast.error("Failed to create group")
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create One </Button>
            </DialogTrigger>
            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Create Group</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="groupname"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center ">
                                        <FormLabel className="text-right">Group Name</FormLabel>
                                        <FormControl className="col-span-3">
                                            <Input placeholder="groupname" {...field} />
                                        </FormControl>
                                        <div />
                                        <FormMessage className="col-span-3"/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center">
                                        <FormLabel className="text-right">Description</FormLabel>
                                        <FormControl className="col-span-3">
                                            <Input placeholder="description" {...field} />
                                        </FormControl>
                                        <div />
                                        <FormMessage className="col-span-3"/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="requiresApproval"
                                render={({ field }) => {
                                    return (
                                    <FormItem className="flex flex-row items-center justify-between">
                                    <FormLabel>Requires Approval</FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}}
                                />
                        </div>
                        <DialogFooter>
                            <Button disabled={isLoading} type="submit">
                            {isLoading? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Creating</span>
                                </>
                            ) : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateGroup;