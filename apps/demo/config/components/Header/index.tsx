import { getClassNameFactory } from "@/core/lib";

import styles from "./styles.module.css";

const getClassName = getClassNameFactory("Header", styles);

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

const Header = ({ editMode }) => (
  <header className={getClassName()}>
    <div className={getClassName("logo")}>LOGO</div>
    <nav className={getClassName("items")}>
      <NavItem label="Home" href={`${editMode ? "/edit" : ""}`} />
      <NavItem label="Pricing" href={`/pricing${editMode ? "/edit" : ""}`} />
      <NavItem label="About" href={`/about${editMode ? "/edit" : ""}`} />
    </nav>
  </header>
);

export { Header };
