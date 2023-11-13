import { ReactNode } from "react";

import { DefaultRootProps } from "@/core";
import { Footer } from "./components/Footer";

export type RootProps = {
  children: ReactNode;
  title: string;
} & DefaultRootProps;

const NavItem = ({ label, href }: { label: string; href: string }) => {
  const navPath = window.location.pathname.replace("/edit", "") || "/";

  const isActive = navPath === (href.replace("/edit", "") || "/");

  return (
    <a
      href={href || "/"}
      style={{
        textDecoration: "none",
        color: isActive
          ? "var(--puck-color-grey-1)"
          : "var(--puck-color-grey-5)",
        fontWeight: isActive ? "600" : "400",
      }}
    >
      {label}
    </a>
  );
};

function Root({ children, editMode }: RootProps) {
  return (
    <>
      <header>
        <div
          style={{
            display: "flex",
            maxWidth: 1280,
            marginLeft: "auto",
            marginRight: "auto",
            padding: 24,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 1.4,
              fontWeight: 800,
              opacity: 0.8,
            }}
          >
            LOGO
          </div>
          <nav style={{ display: "flex", marginLeft: "auto", gap: 32 }}>
            <NavItem label="Home" href={`${editMode ? "/edit" : ""}`} />
            <NavItem
              label="Pricing"
              href={`/pricing${editMode ? "/edit" : ""}`}
            />
            <NavItem label="About" href={`/about${editMode ? "/edit" : ""}`} />
          </nav>
        </div>
      </header>
      {children}
      <Footer>
        <Footer.List title="Section">
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
        </Footer.List>
        <Footer.List title="Section">
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
        </Footer.List>
        <Footer.List title="Section">
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
        </Footer.List>
        <Footer.List title="Section">
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
          <Footer.Link href="#">Label</Footer.Link>
        </Footer.List>
      </Footer>
    </>
  );
}

export default Root;
