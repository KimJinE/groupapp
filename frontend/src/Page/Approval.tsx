import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import styles from "./Dashboard.module.scss";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import moment from "moment";
import { Loader2, RefreshCcw } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter
} from "@/components/ui/table";

export type ApprovalData = {
    groupId: string;
    groupName: string;
    userId: string;
    userName: string;
    displayName: string;
    joinAt: string;
}

function Approval() {
    const [approvalList, setApprovalList] = useState<ApprovalData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // const detailRef = useRef(null);

    const fetchApprovals=useCallback(async (toastMessage : string | null = null) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get<ApprovalData[]>("https://api.didyoudonexx.com/api/groups/pendingmembers", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) {
                setApprovalList(response.data);
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
        fetchApprovals();
    },[fetchApprovals])

    async function ApproveUser(groupId: string, userId: string) {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(`https://api.didyoudonexx.com/api/groups/${groupId}/members/${userId}/approve`, {},{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) {
                fetchApprovals(response.data?.message)
            }
        } catch (e) {
            toast.error("approve failed")
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-4">
                    Approval Request
                    {isLoading && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                </h2>
                <div className="flex items-center space-x-2">
                    <button onClick={()=>fetchApprovals()} disabled={isLoading}><RefreshCcw className="mr-2 h-6 w-6 hover:animate-spin" /></button>
                </div>
            </div>
            <Table className={styles.group_container}>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">User Id</TableHead>
                        <TableHead>User Name</TableHead>
                        <TableHead>Group Id</TableHead>
                        <TableHead>Group Name</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {approvalList.map((member, idx) => (
                    <TableRow key={idx}>
                        <TableCell className="font-medium">{member.userId}</TableCell>
                        <TableCell>{member.displayName || member.userName}</TableCell>
                        <TableCell>{member.groupId}</TableCell>
                        <TableCell>{member.groupName}</TableCell>
                        <TableCell className="text-right">
                            <Button disabled={isLoading} onClick={()=>ApproveUser(member.groupId, member.userId)}>Approve</Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={4}>Total</TableCell>
                    <TableCell className="text-right">{approvalList.length}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}

export default Approval;