import "@arc-ui/components/dist/styles.css";
import "@arc-ui/fonts";

import "core/styles.css";

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
