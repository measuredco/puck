import "core/styles.css";
import "./styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-gb">
      <body>{children}</body>
    </html>
  );
}
