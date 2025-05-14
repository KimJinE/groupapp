import React, { useEffect, createContext, useState } from "react";
import styles from "./Dashboard.module.scss";
import cn from "classnames";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import type { NavLinkProps } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";

export interface User {
    userId: string;
    username: string;
    displayName: string;
    timezone: string;
    lastSeenAt: string;
}


export const UserContext = createContext<{
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
  } | undefined>(undefined);

const linkStyle: NavLinkProps["className"] = ({ isActive })=> cn("text-sm font-medium transition-colors hover:text-primary", {"text-muted-foreground": !isActive});

function MainPage() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        if (user) return;
        async function fetchUserData() {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/auth/login");
                return;
            }

            try {
                const response = await axios.post("api/user/update", {
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                } , {
                    headers: {
                        Authorization: `Bearer ${token}`,
                      }
                })
                setUser(response.data);
            } catch (e) {
                localStorage.removeItem("token");
                navigate("/auth/login");
            }
        }
        fetchUserData();
    },[navigate])
    return (
        <UserContext.Provider value={{ user, setUser }}>
            <div className={styles.main_container}>
                <header className={cn("border-b",styles.header)}>
                    <nav className="flex gap-4">
                        <NavLink to="/" className={linkStyle}>Groups</NavLink>
                        <NavLink to="/approval" className={linkStyle}>Approve</NavLink>
                    </nav>
                    <div className="ml-auto flex items-center space-x-4">
                        <Button variant="ghost" onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth/login");
                        }}>Log out</Button>
                        {/* <Link to="/user">
                            <Avatar className="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </Link> */}
                        <NavLink to="/user" className={linkStyle}>Profile</NavLink>
                    </div>
                </header>
                <main className="flex-1 space-y-4 p-8 pt-6">
                    <Outlet/>
                </main>
            </div>
        </UserContext.Provider>
    )
}

export default MainPage;