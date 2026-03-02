import {
  AppLayoutToolbar,
  Box,
  BreadcrumbGroup,
  Flashbar,
  HelpPanel,
  Icon,
  SideNavigation,
  SpaceBetween,
  TextContent,
  Toggle,
} from "@cloudscape-design/components";
import { useState, type JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/redux/store";
import { removeFlash } from "../app/redux/flashbarSlice";
import { setRole } from "../app/redux/authSlice";
import { setToolsOpen } from "../app/redux/layoutSlice";

export interface AppShellProps {
  children: JSX.Element;
}

function AppShell(props: AppShellProps) {
  const { children } = props;

  const [navigationOpen, setNavigationOpen] = useState<boolean>(true);
  const { breadcrumbs, activeHref, toolsOpen, helpPanelTopic } = useSelector(
    (state: RootState) => state.layout,
  );
  const flashbarItems = useSelector((state: RootState) => state.flashbar.items);
  const role = useSelector((state: RootState) => state.auth.role);
  const dispatch = useDispatch();

  return (
    <AppLayoutToolbar
      navigationOpen={navigationOpen}
      onNavigationChange={(e: any) => setNavigationOpen(e.detail.open)}
      navigation={
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <SideNavigation
            header={{
              href: "/",
              text:
                role === "admin" ? "SupportPilot Admin" : "SupportPilot User",
              logo: {
                alt: "SupportPilot",
                src: "https://ui-avatars.com/api/?name=Support+Pilot&rounded=true",
              },
            }}
            items={[
              { type: "link", text: `Orders`, href: `/orders` },
              { type: "link", text: `Tickets`, href: `/tickets` },
              ...(role === "admin"
                ? ([
                    { type: "link", text: `Documents`, href: `/documents` },
                  ] as const)
                : []),
              { type: "divider" },
            ]}
            activeHref={activeHref}
          />

          <div style={{ marginTop: "auto" }}>
            <Box padding="xl">
              <Toggle
                checked={role === "admin"}
                onChange={(e) =>
                  dispatch(setRole(e.detail.checked ? "admin" : "user"))
                }
              >
                <SpaceBetween size="xs" direction="horizontal">
                  <TextContent>
                    {role === "admin" ? "Admin" : "User"} Mode{" "}
                  </TextContent>
                  <Icon name={role === "admin" ? "key" : "group-active"} />
                </SpaceBetween>
              </Toggle>
            </Box>
          </div>
        </div>
      }
      notifications={
        <Flashbar
          items={flashbarItems.map((item) => ({
            ...item,
            onDismiss: () => dispatch(removeFlash(item.id)),
          }))}
        />
      }
      toolsOpen={toolsOpen}
      onToolsChange={(e: any) => dispatch(setToolsOpen(e.detail.open))}
      tools={
        <HelpPanel
          header={
            <h2>
              {helpPanelTopic === "orders"
                ? "Orders Help"
                : helpPanelTopic === "tickets"
                  ? "Tickets Help"
                  : helpPanelTopic === "home"
                    ? "Dashboard Help"
                    : "Help"}
            </h2>
          }
        >
          {helpPanelTopic === "orders" && (
            <p>
              Use the Orders page to view all customer orders, their statuses, and
              payment states. Click on an order ID to view detailed information or manage it.
            </p>
          )}
          {helpPanelTopic === "tickets" && (
            <p>
              Use the Tickets page to monitor and resolve customer support inquiries.
               You can view the conversation history and escalate tickets to human agents if
              the AI cannot resolve the issue.
            </p>
          )}
          {helpPanelTopic === "home" && (
            <p>
              The SupportPilot Dashboard provides a high-level overview of your 
              business operations. Monitor total revenue, order statuses, and
               customer support ticket metrics at a glance.
            </p>
          )}
          {helpPanelTopic === "default" && (
            <p>Welcome to SupportPilot. Navigate using the sidebar.</p>
          )}
        </HelpPanel>
      }
      breadcrumbs={<BreadcrumbGroup items={breadcrumbs} />}
      content={children}
    />
  );
}

export default AppShell;
