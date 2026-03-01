import {
  AppLayout,
  BreadcrumbGroup,
  ContentLayout,
  Flashbar,
  Header,
  HelpPanel,
  Link,
  SideNavigation,
} from "@cloudscape-design/components";
import { useState, type JSX } from "react";

export interface AppShellProps {
  children: JSX.Element;
}

function AppShell(props: AppShellProps) {
  const { children } = props;

  const [toolsOpen, setToolsOpen] = useState<boolean>(false);
  const [navigationOpen, setNavigationOpen] = useState<boolean>(true);

  return (
    <AppLayout
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Home", href: "#" },
            { text: "Service", href: "#" },
          ]}
        />
      }
      navigationOpen={navigationOpen}
      onNavigationChange={(e) => setNavigationOpen(e.detail.open)}
      navigation={
        <SideNavigation
          header={{
            href: "/",
            text: "SupportPilot",
          }}
          items={[{ type: "link", text: `Page #1`, href: `#` }]}
        />
      }
      notifications={
        <Flashbar
          items={[
            {
              type: "info",
              dismissible: true,
              content: "This is an info flash message.",
              id: "message_1",
            },
          ]}
        />
      }
      toolsOpen={toolsOpen}
      onToolsChange={(e) => setToolsOpen(e.detail.open)}
      tools={<HelpPanel header={<h2>Overview</h2>}>Help content</HelpPanel>}
      content={
        <ContentLayout
          header={
            <Header variant="h1" info={<Link variant="info">Info</Link>}>
              Page header
            </Header>
          }
        >
          {children}
        </ContentLayout>
      }
    />
  );
}

export default AppShell;
