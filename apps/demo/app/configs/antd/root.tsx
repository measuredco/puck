import React, { ReactNode } from "react";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, Typography, theme } from "antd";
import Footer from "rc-footer";

import "rc-footer/assets/index.css";

const { Header, Content, Sider } = Layout;

const items1: MenuProps["items"] = [
  { key: "/", label: "Home" },
  { key: "/about", label: "About" },
];

const items2: MenuProps["items"] = [
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
].map((icon, index) => {
  const key = String(index + 1);

  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `subnav ${key}`,

    children: new Array(4).fill(null).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `option${subKey}`,
      };
    }),
  };
});

export type RootProps = {
  children: ReactNode;
  layout: string;
  title: string;
  editMode: boolean;
};

export const Root = ({ children, layout, editMode }: RootProps) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const navPath =
    window.location.pathname.replace("/antd", "").replace("/edit", "") || "/";

  return (
    <Layout>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <Typography.Text
          style={{ color: "white", marginRight: 48, whiteSpace: "nowrap" }}
        >
          <b>Ant Design</b>
        </Typography.Text>
        <Menu
          style={{ width: "100%" }}
          theme="dark"
          mode="horizontal"
          items={items1}
          selectedKeys={[navPath]}
          onSelect={(item) => {
            if (editMode) {
              window.location.href = `/antd/${item.key}/edit`;
            } else {
              window.location.href = `/antd/${item.key}`;
            }
          }}
        />
      </Header>
      <Layout>
        {layout === "sidebar" && (
          <>
            <Sider width={200} style={{ background: colorBgContainer }}>
              <Menu
                mode="inline"
                defaultSelectedKeys={["1"]}
                defaultOpenKeys={["sub1"]}
                style={{ height: "100%", borderRight: 0 }}
                items={items2}
              />
            </Sider>

            <Layout style={{ padding: "0 24px 24px" }}>
              <Content
                style={{
                  marginTop: 24,
                  minHeight: 280,
                  background: colorBgContainer,
                }}
              >
                {children}
              </Content>
            </Layout>
          </>
        )}
        {layout !== "sidebar" && children}
      </Layout>
      <Footer
        columns={[
          {
            title: "Column 1",
            items: [
              { url: "#", title: "Link 1" },
              { url: "#", title: "Link 2" },
              { url: "#", title: "Link 3" },
              { url: "#", title: "Link 4" },
            ],
          },
          {
            title: "Column 2",
            items: [
              { url: "#", title: "Link 1" },
              { url: "#", title: "Link 2" },
              { url: "#", title: "Link 3" },
              { url: "#", title: "Link 4" },
            ],
          },
          {
            title: "Column 3",
            items: [
              { url: "#", title: "Link 1" },
              { url: "#", title: "Link 2" },
              { url: "#", title: "Link 3" },
              { url: "#", title: "Link 4" },
            ],
          },
          {
            title: "Column 4",
            items: [
              { url: "#", title: "Link 1" },
              { url: "#", title: "Link 2" },
              { url: "#", title: "Link 3" },
              { url: "#", title: "Link 4" },
            ],
          },
        ]}
        bottom="Puck demo"
      />
    </Layout>
  );
};
