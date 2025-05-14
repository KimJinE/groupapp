import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import React, { useEffect, useState, useContext, useCallback } from "react";
import { UserContext } from "../MainPage";
import { Group } from "../Dashboard";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter
} from "@/components/ui/table";

import moment from "moment";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import styles from "./Dialog.module.scss"
import { Button } from "@/components/ui/button";
import { CancelConfirmation } from "../Dashboard";
import { toast } from "sonner";

type GroupDetailProps = {
    open: boolean;
    selectGroup: Group | null;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectGroup: React.Dispatch<React.SetStateAction<Group | null>>;
    fetchGroups: (toastMessage: string | undefined) => void;
};

type Member = {
    userId: string;
    username: string;
    joinAt: string;
    timezone: string;
    completionDates: string[];
    completeAt: string;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ open, setOpen, setSelectGroup, selectGroup, fetchGroups}) => {
    const [completedMember, setCompletedMembers] = useState<Member[]>([]);
    const [lazyMember, setLazyMembers] = useState<Member[]>([]);
    const isAdmin: boolean | undefined = selectGroup?.admin;
    const usercontext = useContext(UserContext);
    const user = usercontext?.user;

    const fetchMembers = useCallback(async() => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<Member[]>(`/api/groups/${selectGroup?.groupId}/members`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) {
                const completeList: Member[] = [];
                const lazyList:  Member[] = [];
                response.data.forEach((member) => {
                    if (member.completeAt) {
                        completeList.push(member);
                    } else {
                        lazyList.push(member);
                    }
                })
                setCompletedMembers(completeList);
                setLazyMembers(lazyList);
            }
        } catch (e) {
            toast.error("can't get group member information")
        }
    },[selectGroup])
    useEffect(() => {
        if (open) {
            fetchMembers();
        }
    },[selectGroup, open, fetchMembers])
    function convertTime(timeString: string, timeZone: string) {
        const date = parseISO(timeString);

        const fakeLocalTime = format(date, "yyyy-MM-dd HH:mm");
        const tzAbbr = formatInTimeZone(date, timeZone, "zzz");

        return `${fakeLocalTime} (${tzAbbr})`;
    }

    async function leaveGroup() {
        try {
            const token = localStorage.getItem('token');
            let response;
            if (isAdmin) {
                response = await axios.delete(`/api/groups/${selectGroup?.groupId}/delete`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                response = await axios.delete(`/api/groups/${selectGroup?.groupId}/leave`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            if (response.data) {
                setOpen(false);
                fetchGroups(response.data?.message);
            }
        } catch (e) {
            toast.error('Error to delete')
        }
    }

    async function removeMember(memberId: string) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/api/groups/${selectGroup?.groupId}/member/${memberId}/remove`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) {
                fetchMembers();
                toast(`Remove user with id: ${memberId}`, {
                    description: moment().format("dddd, MMMM DD, YYYY [at] h:mm A")
                })
            }
        } catch (e) {
            toast.error('Error to remove')
        }
    }

    return (
        <Dialog 
            open={open} 
            onOpenChange={(e)=>{
                if (!e) setSelectGroup(null);
                setOpen(e);
            }}
        >
            <DialogContent className="max-w-3xl" style={{maxHeight: "100vh", overflow:"auto"}}>
                <DialogHeader>
                <DialogTitle className="text-left">{selectGroup?.groupName}</DialogTitle>
                {selectGroup && (
                    <div className="space-y-2 mt-2">
                        <p className="text-left"><strong>Description:</strong> {selectGroup.description}</p>
                        <p className="text-left"><strong>Created At:</strong> {new Date(selectGroup.createdAt).toLocaleString()}</p>
                        <p className="text-left"><strong>Timezone:</strong> {selectGroup.timezone}</p>
                        <p className="text-left"><strong>Completion:</strong> {`${selectGroup.completedCount}/${selectGroup.memberCount}`}</p>
                        <CancelConfirmation 
                            trigger={<Button variant="destructive">{isAdmin? "Delete": "Leave"}</Button>}
                            confirm={leaveGroup}
                        />
                        {completedMember.length>0 && (
                            <>
                                <p className="text-left">Prople completed their task: </p>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Name</TableHead>
                                            <TableHead>Completed At</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right">Complete detail</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {completedMember.map((member, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{member.username}</TableCell>
                                            <TableCell>{convertTime(member.completeAt, member.timezone)}</TableCell>
                                            <TableCell>{convertTime(member.joinAt, member.timezone)}</TableCell>
                                            <TableCell className="text-right">{`${member.completionDates.length}/${moment().diff(moment(member.joinAt).startOf('day'), 'days') + 1}`}</TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    {user?.userId !== member.userId && <CancelConfirmation 
                                                        trigger={<Button variant="destructive">Remove</Button>}
                                                        confirm={()=>removeMember(member.userId)}
                                                    />}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                        <TableCell colSpan={3}>Total</TableCell>
                                        <TableCell className="text-right">{completedMember.length}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </>
                        )}
                        {lazyMember.length>0 && (
                            <>
                                <p className="text-left">Lazy prople: </p>
                                <Table className={styles.member_table}>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Name</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right">Complete detail</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lazyMember.map((member, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{member.username}</TableCell>
                                            <TableCell>{convertTime(member.joinAt, member.timezone)}</TableCell>
                                            <TableCell className="text-right">{`${member.completionDates.length}/${moment().diff(moment(member.joinAt).startOf('day'), 'days') + 1}`}</TableCell>
                                            {isAdmin && (
                                                <TableCell className="text-right">
                                                    {user?.userId !== member.userId && <CancelConfirmation 
                                                        trigger={<Button variant="destructive">Remove</Button>}
                                                        confirm={()=>removeMember(member.userId)}
                                                    />}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                        <TableCell className="text-left" colSpan={2}>Total</TableCell>
                                        <TableCell className="text-right">{lazyMember.length}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </>
                        )}
                    </div>
                )}
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default GroupDetail;