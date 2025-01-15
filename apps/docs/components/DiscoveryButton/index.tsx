import { Button } from "@/core/components/Button";

export function DiscoveryButton() {
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
