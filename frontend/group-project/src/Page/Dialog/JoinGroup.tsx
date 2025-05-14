import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios, {AxiosResponse} from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type JoinGroupProps = {
    onGroupJoined: (toastMessage: string | null) => void;
}
const JoinGroup: React.FC<JoinGroupProps> = ({onGroupJoined}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [groupId, setGroupId] = useState<string>();
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function joinGroupCall() {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response: AxiosResponse = await axios.post<string>("/api/groups/join", {
                groupId: groupId,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.data) {
                setIsLoading(false);
                setOpen(false);
                onGroupJoined(response.data.message);
            }
        } catch (error) {
            setIsLoading(false);
            toast.error("join error");
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Join New</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Join Group</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="groupid" className="text-right">
                        Group Id
                    </Label>
                    <Input id="groupid" value={groupId} onChange={(e)=>{
                        const value = e.target.value;
                        setGroupId(value);
                        if (isNaN(Number(value))) {
                            setError("must be a number");
                        } else {
                            setError("");
                        }
                    }} className="col-span-3" />
                    {error && (
                        <>
                            <div/>
                            <p className="text-[0.8rem] font-medium text-destructive">{error}</p>
                        </>
                    )}
                </div>
                <DialogFooter>
                    <Button disabled={isLoading} type="button" onClick={joinGroupCall}>
                        {isLoading? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Joining</span>
                            </>
                        ) : "Join"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default JoinGroup;