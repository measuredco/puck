import React from "react";

import styles from "./styles.module.css";
import getClassNameFactory from "@/core/lib/get-class-name-factory";
import { Button } from "@/core/components/Button";
import Link from "next/link";

const getClassName = getClassNameFactory("Home", styles);

export default function CallButton() {
  return (
    <>
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
    (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "puck-enquiry", {origin:"https://cal.com"});
  Cal.ns["puck-enquiry"]("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
  `,
        }}
      />

      <Button
        data-cal-link="chrisvxd/puck-enquiry"
        data-cal-namespace="puck-enquiry"
        data-cal-config='{"layout":"month_view"}'
        variant="primary"
      >
        Book discovery call
      </Button>
    </>
  );
}

const MeasuredLogo = () => (
  <span>
    <svg
      fill="currentColor"
      aria-labelledby="measured"
      height="30"
      role="img"
      viewBox="0 0 454 70"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="measured">Measured</title>
      <path d="M69.1 69.1V43c0-23.7-19.3-43-43-43H0v30.7h26.1c6.8 0 12.3 5.5 12.3 12.3v26.1h30.7Zm52.8-60.4 13 31.5h.6l12.9-31.5h15.3v50.9h-12V28.3h-.4l-12.3 31h-7.7l-12.2-31.2h-.4v31.5h-12V8.7h15.2Zm45.9 32c0-11.8 7.4-19.8 19-19.8s18.5 6.9 18.5 19.5v3h-25.5v.3c0 4.7 2.9 7.8 7.6 7.8 4.7 0 5.7-1.4 6.6-3.9l11.2.3c-1.4 7.5-8 12.4-18 12.4s-19.3-7.4-19.3-19.7l-.1.1Zm26.2-4.3c0-3.9-2.9-6.7-6.9-6.7s-7 2.9-7.2 6.7h14.2-.1ZM208.7 49c0-8.5 6.5-11.3 14.2-12 6.5-.6 9.1-1.1 9.1-3.4 0-2.7-1.9-4.1-4.9-4.1-3 0-5.2 1.5-5.7 3.9l-11.2-.4c1-7 6.8-12.1 17.1-12.1s16.9 4.7 16.9 12.7v26h-11.4v-5.3h-.3c-2.1 3.9-5.8 6-11.1 6s-12.6-3.7-12.6-11.2l-.1-.1Zm23.3-3v-3.6c-1.4.7-4.2 1.2-6.4 1.5-3.5.5-5.4 2-5.4 4.5s2 3.9 4.8 3.9 7-2.5 7-6.3Zm39.6-12.6c-.3-2.4-2.6-4.1-5.8-4.1-3.2 0-5.1 1.2-5.1 3.1 0 1.5 1 2.6 4.3 3.3l7.4 1.4c7.6 1.5 11.3 4.8 11.3 10.4 0 7.9-7.5 13-17.7 13s-17.4-4.9-18.3-12.4l12-.3c.5 2.8 2.9 4.3 6.3 4.3s5.2-1.3 5.3-3.2c0-1.7-1.5-2.7-4.7-3.3l-6.7-1.3c-7.6-1.4-11.4-5.2-11.3-11.1 0-7.7 6.5-12.2 16.9-12.2 10.4 0 16.5 4.6 17.2 12.2l-11.2.3.1-.1Zm40.5-12h12.2v38.2h-11.6v-7.1h-.4c-1.7 4.7-5.9 7.6-11.7 7.6-5.8 0-13.1-5.7-13.1-14.4V21.3h12.2v22c0 4.2 2.3 6.7 6 6.7s6.4-2.5 6.4-6.9V21.4Zm17.9 0h11.8v7h.4c1.4-5.1 4.7-7.5 8.9-7.5s2.4.2 3.4.4v10.6c-1.2-.4-3.3-.6-4.8-.6-4.4 0-7.6 3.1-7.6 7.6v20.8h-12.2V21.5l.1-.1Zm25.9 19.3c0-11.8 7.4-19.8 19-19.8s18.5 6.9 18.5 19.5v3h-25.5v.3c0 4.7 2.9 7.8 7.6 7.8 4.7 0 5.7-1.4 6.6-3.9l11.2.3c-1.4 7.5-8 12.4-18 12.4S356 52.9 356 40.6l-.1.1Zm26.2-4.3c0-3.9-2.9-6.7-6.9-6.7s-7 2.9-7.2 6.7h14.2-.1Zm14.8 4.1c0-13.5 7.2-19.6 15.2-19.6 8 0 9.4 3.5 10.8 7h.2V8.6h12.2v51h-12v-6.2h-.4c-1.5 3.5-5 6.7-10.7 6.7-8.4 0-15.3-6.6-15.3-19.6Zm26.5 0c0-6.2-2.6-10.1-7-10.1s-7 4-7 10.1 2.5 10.2 7 10.2 7-4 7-10.2Zm17.5 13.4c0-3.5 2.9-6.4 6.5-6.4s6.4 2.9 6.5 6.4c0 3.6-3.1 6.5-6.5 6.5s-6.5-2.9-6.5-6.5Z"></path>
    </svg>
  </span>
);

export const Home = () => {
  return (
    <div className={getClassName()}>
      <div className={getClassName("title")}>
        <h1 style={{ visibility: "hidden" }}>Puck</h1>

        <span>Open-source under MIT</span>
        <h2 className={getClassName("heading")}>The visual editor for React</h2>
      </div>
      <div style={{ paddingTop: 24 }} />
      <div className={getClassName("description")}>
        <p style={{ fontSize: 18, lineHeight: 1.5, opacity: 0.7 }}>
          Puck empowers developers to build amazing visual editing experiences
          into their own React applications, powering the next generation of
          content tools, no-code builders and WYSIWYG editors.
        </p>
      </div>
      <div style={{ paddingTop: 32 }} />
      <div className={getClassName("ctas")}>
        <div className={getClassName("actions")}>
          <Link href="/docs" style={{ display: "flex" }}>
            <Button>Read docs</Button>
          </Link>
          <Button href="https://demo.puckeditor.com/edit" variant="secondary">
            View demo
          </Button>
        </div>
        <div style={{ paddingTop: 32 }} />
        <pre style={{ padding: 0, margin: 0 }}>
          <span style={{ userSelect: "none" }}>~ </span>npm i @measured/puck
          --save
        </pre>
      </div>
      <div className={getClassName("peakWrapper")}>
        <div className={getClassName("builtBy")}>
          <p>Built by</p>
          <Link href="https://measured.co" target="_blank">
            <MeasuredLogo />
          </Link>
        </div>

        <div>
          <div className={getClassName("dot")} />
          <div className={getClassName("dot")} />
          <div className={getClassName("dot")} />
        </div>

        <div className={getClassName("peak")}>
          <div className={getClassName("card")}>
            <h2 className={getClassName("cardHeading")} id="support">
              Stuck with Puck?
            </h2>
            <p>
              Puck is built by{" "}
              <Link href="https://measured.co" target="_blank">
                Measured
              </Link>
              , experts in UI strategy. We provide premium Puck support, design
              system builds, and consultancy.
            </p>
            <div className={getClassName("cardActions")}>
              <CallButton />
              <Button
                href="https://discord.gg/D9e4E3MQVZ"
                variant="secondary"
                newTab
              >
                Join Discord — Free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
