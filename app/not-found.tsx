import type { Metadata } from "next";
import LocaleLayout from "./[locale]/layout";
import NotFound from "./[locale]/not-found";

/**
 * 404 for requests the locale middleware never sees (paths with a file
 * extension, for example /old-page.php). The root layout renders no <html>,
 * so this wraps the branded 404 in the English locale layout itself, giving
 * it the same nav, footer and skip link as every other page.
 */
export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist on the Red Rose Technologies site.",
};

export default function RootNotFound() {
  return (
    <LocaleLayout params={{ locale: "en" }}>
      <NotFound />
    </LocaleLayout>
  );
}
