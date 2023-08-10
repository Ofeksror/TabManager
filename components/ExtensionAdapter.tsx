"use client";
import React, { useEffect, useRef } from "react";
import { tabType, useSelectedWorkspace, workspaceType } from "@/utilities/WorkspaceContext";
import { useDatabase } from "@/utilities/databaseContext";
import { useSession } from "next-auth/react";

// import { } from "@/utilities/ExtensionHelpers";

type Props = {};

const ExtensionAdapter = (props: Props) => {
    const session = useSession();
    const { selectedWorkspace, setSelectedWorkspace } = useSelectedWorkspace();
    const { refreshWorkspace, refreshWorkspaces } = useDatabase();

    const selectedWorkspaceRef = useRef(selectedWorkspace)
    useEffect(() => {
        selectedWorkspaceRef.current = selectedWorkspace;
    }, [selectedWorkspace])


    const communicationHandler = async ({data: message}: any) => {
        console.log(message);

        if (selectedWorkspaceRef.current === null) {
            console.log("No workspace selected");
            return;
        }

        switch (message.event) {
            case "EXT_TAB_CREATED": {
                const newTab: tabType = {
                    _id: null,
                    title: message.tab.title,
                    url: message.tab.url,
                    pinned: message.tab.pinned,
                    browserTabId: message.tab.browserTabId,
                    faviconUrl: message.tab.faviconUrl
                }
                
                const newTabsList: tabType[] = [
                    ...selectedWorkspaceRef.current.tabs.slice(0, message.tab.index),
                    newTab,
                    ...selectedWorkspaceRef.current.tabs.slice(message.tab.index)
                ]
                
                const newWorkspace: workspaceType = {
                    ...selectedWorkspaceRef.current,
                    tabs: newTabsList
                }

                setSelectedWorkspace(newWorkspace);
                refreshWorkspace(newWorkspace);

                break;
            }
            case "EXT_TAB_UPDATED": {

                break;
            }
            default: {
                console.log(`No handling for this event ${message.event} yet.`)
                break;
            }
        }
    }

    useEffect(() => {
        window.addEventListener("message", communicationHandler);
    }, []);

    return (
        <div>
            <button>Sync to DB</button>
        </div>
    );
};

export default ExtensionAdapter;