import styles from "./Login.module.scss";
import { Outlet } from "react-router-dom";

function AuthLayout() {
    return (
        <div className={styles.container}>
            <div className={styles.left_side}>
                <span><strong>You Done xx today?</strong></span>
                <span><strong>Hello, this is Ente Jin!</strong><br/>This is a simple app track if you done your task everyday. I built it to motivate myself to hit the gym and stay consistent with my studies.<br/>Feel free to share your feedback — together, we can build even more useful tools!</span>
            </div>
            <div className={styles.right_side}>
                <Outlet/>
            </div>
        </div>
    )
}

export default AuthLayout;