import { ReactNode } from "react";

import { DefaultRootProps } from "@measured/puck";
import { Footer } from "./components/Footer";
import { NavItem } from "./components/NavItem";

export type RootProps = {
  children: ReactNode;
  title: string;
  suffix?: string;
} & DefaultRootProps;

function Root({ children, suffix = "" }: RootProps) {
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
            <NavItem label="Home" href={`${suffix || "/"}`} />
            <NavItem label="Pricing" href={`/pricing${suffix}`} />
            <NavItem label="About" href={`/about${suffix}`} />
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
