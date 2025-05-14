import styles from "./Dashboard.module.scss";
import { Outlet, NavLink } from "react-router-dom";
import type { NavLinkProps } from "react-router-dom";
import cn from "classnames";

const linkStyle: NavLinkProps["className"] = ({ isActive })=> cn(styles.link_style, "rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-9 px-4 py-2", {"bg-muted hover:bg-muted": isActive}, {"hover:bg-transparent hover:underline": !isActive});

function Profile() {
    return (
        <div className="space-y-6 p-10 pb-16 md:block">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your account settings.</p>
            </div>
            <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full my-6"></div>
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="lg:w-1/5">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        <NavLink className={linkStyle} to="" end>Profile</NavLink>
                        <NavLink className={linkStyle} to="security">Security</NavLink>
                        <NavLink to="contact" className={linkStyle}> Contact</NavLink>
                    </nav>
                </aside>
                <div className="flex-1 lg:max-w-2xl"><Outlet/></div>
            </div>
        </div>
    )
}

export default Profile;