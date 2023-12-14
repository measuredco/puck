import { useEffect, useState } from "react";

import packageJson from "../../package.json";
import { getClassNameFactory } from "@/core/lib";

import styles from "./styles.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://puckeditor.com";

const { version } = packageJson;

const getClassName = getClassNameFactory("ReleaseSwitcher", styles);

export const ReleaseSwitcher = ({
  variant = "default",
}: {
  variant?: "light" | "default";
}) => {
  const isCanary = process.env.NEXT_PUBLIC_IS_CANARY === "true" || false;
  const isLatest = process.env.NEXT_PUBLIC_IS_LATEST === "true" || false;

  const currentValue = isCanary ? "canary" : isLatest ? "" : version;

  const [options, setOptions] = useState<{ value: string; label: string }[]>([
    {
      label: "canary",
      value: "canary",
    },
    ...(isCanary
      ? []
      : [
          {
            label: isLatest ? `v${version} (latest)` : `v${version}`,
            value: isLatest ? "" : version,
          },
        ]),
  ]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/releases`).then(async (res) => {
      const { releases } = await res.json();
      const releaseOptions = Object.keys(releases).map((key) => ({
        label: key,
        value: key,
      }));

      releaseOptions[0].label = `v${releaseOptions[0].label} (latest)`;
      releaseOptions[0].value = "";

      setOptions([{ label: "canary", value: "canary" }, ...releaseOptions]);
    });
  }, []);

  return (
    <select
      className={getClassName({ [variant]: true })}
      value={currentValue}
      onChange={(e) => {
        const newHref = e.currentTarget.value
          ? `/v/${e.currentTarget.value}`
          : "https://puckeditor.com";

        if (window.parent) {
          window.parent.location.href = newHref;
        } else {
          window.location.href = newHref;
        }
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
