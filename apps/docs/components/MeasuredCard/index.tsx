import styles from "./styles.module.css";
import getClassNameFactory from "@/core/lib/get-class-name-factory";
import { Button } from "@/core/components/Button";
import { DiscoveryButton } from "../DiscoveryButton";

import Link from "next/link";

const getClassName = getClassNameFactory("MeasuredCard", styles);

export const MeasuredCard = () => (
  <div className={getClassName()}>
    <h2 className={getClassName("heading")} id="support">
      Stuck with Puck?
    </h2>
    <p>
      Puck is built by{" "}
      <Link href="https://measured.co" target="_blank">
        Measured
      </Link>
      , experts in UI strategy. We provide premium Puck support, design system
      builds, and consultancy.
    </p>
    <div className={getClassName("actions")}>
      <DiscoveryButton />
      <Button href="https://discord.gg/D9e4E3MQVZ" variant="secondary" newTab>
        Join Discord — Free
      </Button>
    </div>
  </div>
);
