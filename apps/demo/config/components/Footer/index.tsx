import { ReactNode } from "react";
import { Section } from "../Section";

const FooterLink = ({ children, href }: { children: string; href: string }) => {
  return (
    <li style={{ paddingBottom: 8 }}>
      <a
        href={href}
        style={{
          textDecoration: "none",
          fontSize: "14px",
          color: "var(--puck-color-grey-05)",
        }}
      >
        {children}
      </a>
    </li>
  );
};

const FooterList = ({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) => {
  return (
    <div>
      <h3
        style={{
          margin: 0,
          padding: 0,
          fontSize: "inherit",
          fontWeight: "600",
          color: "var(--puck-color-grey-03)",
        }}
      >
        {title}
      </h3>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          paddingTop: 12,
        }}
      >
        {children}
      </ul>
    </div>
  );
};

const Footer = ({ children }: { children: ReactNode }) => {
  return (
    <footer style={{ background: "var(--puck-color-grey-12)" }}>
      <h2 style={{ visibility: "hidden", height: 0, margin: 0 }}>Footer</h2>
      <Section padding="32px">
        <div
          style={{
            display: "grid",
            gridGap: 24,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            paddingTop: 24,
            paddingBottom: 24,
          }}
        >
          {children}
        </div>
      </Section>
      <div
        style={{
          padding: 64,
          textAlign: "center",
          color: "var(--puck-color-grey-03)",
          background: "var(--puck-color-grey-11)",
        }}
      >
        Made by{" "}
        <a
          href="https://measured.co"
          target="_blank"
          style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
        >
          Measured
        </a>
      </div>
    </footer>
  );
};

Footer.List = FooterList;
Footer.Link = FooterLink;

export { Footer };
