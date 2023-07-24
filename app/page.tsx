"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

import { useEffect, useRef } from "react";

import Sidebar from "./components/Sidebar";
import Workspace from "./components/Workspace";

import UpdateSession from "../components/demo/UpdateSession";

import {
    SelectedWorkspaceProvider,
    workspaceType,
} from "../utilities/WorkspaceContext";
import { DatabaseProvider, useDatabase } from "../utilities/databaseContext";
import { ObjectId } from "mongodb";

const styles = {
    outerContainer: "w-full h-full flex",
    rootContainer: "h-screen w-screen",
    mainContent: "bg-slate-200 w-full h-full",
};

export default function Home() {
    const session = useSession();
    const { refreshWorkspaces } = useDatabase();

    const hasRun = useRef(false);

    useEffect(() => {
        if (session.status === "unauthenticated") {
            return redirect("/login");
        }
    }, [session]);

    useEffect(() => {
        if (session.status === "unauthenticated") return redirect("/login");

        if (session.status === "authenticated" && !hasRun.current) {
            hasRun.current = true;
            refreshWorkspaces();
        }
    }, [session]);

    return (
        <div className={styles.rootContainer}>
            <div className={styles.outerContainer}>
                <Sidebar />
                <div className={styles.mainContent}>
                    <Workspace />
                </div>
            </div>

            <div>
                <UpdateSession />
            </div>
        </div>
    );
}
