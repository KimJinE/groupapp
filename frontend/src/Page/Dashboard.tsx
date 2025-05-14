import axios, {AxiosResponse} from "axios";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./Dashboard.module.scss";
import { Card, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import cn from "classnames";
import CreateGroup from "./Dialog/CreateGroup";
import JoinGroup from "./Dialog/JoinGroup";
import GroupDetail from "./Dialog/GroupDetail";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import moment from "moment";
import { Loader2, Copy, RefreshCcw } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

export type Group = {
    groupId: string;
    groupName: string;
    description: string;
    admin: boolean;
    createdAt: string;
    timezone: string;
    completed: boolean;
    memberCount: number;
    completedCount: number;
}

function Dashboard() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectGroup, setSelectGroup] = useState<Group | null>(null);
    // const detailRef = useRef(null);

    const fetchGroups=useCallback(async (toastMessage : string | null = null) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get<Group[]>("/api/groups", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) {
                setGroups(response.data);
                setIsLoading(false);
                if (toastMessage) toast(toastMessage, {
                    description: moment().format("dddd, MMMM DD, YYYY [at] h:mm A")
                })
            }
        } catch (e) {
            setIsLoading(false);
        }
    },[])

    useEffect(() => {
        fetchGroups();
    },[fetchGroups])

    async function completeTask(groupid: string) {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response: AxiosResponse<string> = await axios.post(`/api/groups/${groupid}/complete`, {},{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) {
                fetchGroups("You Completed your task")
            }
        } catch (e) {
            console.error("Failed to copy text: ", e)
        }
    }

    async function copyToClipBoard(message: string) {
        try {
            await navigator.clipboard.writeText(message)
            toast(`Copied Group Id: ${message} to clipBoard`, {
                description: moment().format("dddd, MMMM DD, YYYY [at] h:mm A")
            })
          } catch (err) {
            console.error("Failed to copy text: ", err)
          }
          return
    }

    return (
        <div className={styles.container}>
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-4">
                    Groups
                    {isLoading && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                </h2>
                <div className="flex items-center space-x-2">
                    <button onClick={()=>fetchGroups()} disabled={isLoading}><RefreshCcw className="mr-2 h-6 w-6 hover:animate-spin" /></button>
                    <JoinGroup onGroupJoined={fetchGroups}/>
                    <CreateGroup onGroupCreated={fetchGroups}/>
                </div>
            </div>
            <div className={cn(styles.group_container, "grid gap-4 md:grid-cols-2 lg:grid-cols-4")}>
                {groups.map((group, idx) => {
                    const isAdmin: boolean = group.admin;
                    return (
                        <Card key={idx}>
                            <CardHeader className="flex justify-between items-center">
                                <CardTitle>{group.groupName}</CardTitle>
                                <span className="flex items-center gap-2">
                                    id: {group.groupId} 
                                    <Copy aria-label="copy" onClick={()=>copyToClipBoard(group.groupId)} className="mr-2 h-4 w-4" />
                                </span>
                            </CardHeader>
                            <div className={cn("px-6", styles.card_content)}>
                                <div className={styles.card_row}>
                                    <span className="">Statue:</span>
                                    <span className="">{group.completed ? 'Completed' : 'InComplete'}</span>
                                </div>
                                <div className={styles.card_row}>
                                    <span className="">Completion:</span>
                                    <span className="">{`${group.completedCount}/${group.memberCount}`}</span>
                                </div>
                            </div>
                            <CardFooter className="flex justify-end gap-4 flex-wrap">
                                <Button variant="outline" onClick={() => {
                                    setSelectGroup(group);
                                    setOpen(true);
                                }}>{isAdmin? "manege Group" : "view Detail"}</Button>
                                {!group.completed && (
                                    <Button disabled={isLoading} onClick={()=>completeTask(group.groupId)}>I Complete it</Button>
                                )}
                            </CardFooter>
                        </Card>
                    )}
                )}
            </div>
            <GroupDetail open={open} setOpen={setOpen} selectGroup={selectGroup} setSelectGroup={setSelectGroup} fetchGroups={fetchGroups}/>
        </div>
    )
}

export default Dashboard;

type CancelConfirmationProps = {
    trigger: React.ReactNode;
    confirm: () => void;
};

export const CancelConfirmation: React.FC<CancelConfirmationProps> = ({trigger, confirm}) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirm}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )

}