"use client";

import { usePathname } from "next/navigation";

export const NavItem = ({
  label,
  href = "/",
}: {
  label: string;
  href: string;
}) => {
  const navPath =
    usePathname().replace("/edit", "").replace("/preview", "") || "/";

  const isActive = navPath === href;

  return (
    <a
      href={href}
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
