import { getClassNameFactory } from "@/core/lib";

import styles from "./styles.module.css";

const getClassName = getClassNameFactory("Header", styles);

const NavItem = ({ label, href }: { label: string; href: string }) => {
  const navPath = window.location.pathname.replace("/edit", "") || "/";

  const isActive = navPath === (href.replace("/edit", "") || "/");

  const El = href ? "a" : "span";

  return (
    <El
      href={href || "/"}
      style={{
        textDecoration: "none",
        color: isActive
          ? "var(--puck-color-grey-02)"
          : "var(--puck-color-grey-06)",
        fontWeight: isActive ? "600" : "400",
      }}
    >
      {label}
    </El>
  );
};

const Header = ({ editMode }) => (
  <header className={getClassName()}>
    <div className={getClassName("logo")}>LOGO</div>
    <nav className={getClassName("items")}>
      <NavItem label="Home" href={`${editMode ? "" : "/"}`} />
      <NavItem label="Pricing" href={editMode ? "" : "/pricing"} />
      <NavItem label="About" href={editMode ? "" : "/about"} />
    </nav>
  </header>
);

export { Header };
