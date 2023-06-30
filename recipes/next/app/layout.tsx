import "@arc-ui/components/dist/styles.css";
import "@arc-ui/fonts";

import "@puck/core/styles.css";
import "./styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
