import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/instrument-serif/latin-400.css";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "OpenWash · Claim register", template: "%s · OpenWash" },
  description: "Bonded open-source model claims on GenLayer Studionet.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <Link className="brand" href="/">
              <i className="mark" aria-hidden="true">
                ≋
              </i>
              OpenWash
            </Link>
            <div className="navlinks">
              <Link href="/">Register</Link>
              <Link href="/challenge">Challenge</Link>
              <Link href="/publisher">Publisher</Link>
              <Link href="/rules">Rules</Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <span>OpenWash · GenLayer Studionet</span>
          <span>Technical grade · Not legal advice</span>
        </footer>
      </body>
    </html>
  );
}
