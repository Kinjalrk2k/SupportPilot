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
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { removeFlash } from "../app/flashbarSlice";

export interface AppShellProps {
  children: JSX.Element;
}

function AppShell(props: AppShellProps) {
  const { children } = props;

  const [toolsOpen, setToolsOpen] = useState<boolean>(false);
  const [navigationOpen, setNavigationOpen] = useState<boolean>(true);
  const layout = useSelector((state: RootState) => state.layout);
  const flashbarItems = useSelector((state: RootState) => state.flashbar.items);
  const dispatch = useDispatch();

  return (
    <AppLayout
      navigationOpen={navigationOpen}
      onNavigationChange={(e) => setNavigationOpen(e.detail.open)}
      navigation={
        <SideNavigation
          header={{
            href: "/",
            text: "SupportPilot",
          }}
          items={[
            { type: "link", text: `Orders`, href: `/orders` },
            { type: "link", text: `Tickets`, href: `/tickets` },
            { type: "link", text: `Documents`, href: `/documents` },
          ]}
        />
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
      onToolsChange={(e) => setToolsOpen(e.detail.open)}
      tools={<HelpPanel header={<h2>Overview</h2>}>Help content</HelpPanel>}
      breadcrumbs={<BreadcrumbGroup items={layout.breadcrumbs} />}
      content={
        <ContentLayout
          header={
            <Header variant="h1" description={layout.pageDescription}>
              {layout.pageHeader}
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
