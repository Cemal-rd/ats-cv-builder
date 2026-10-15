import { BuilderLoader } from "@/components/builder/builder-loader";
import { I18nProvider } from "@/i18n/provider";
import { siteMetadata } from "../site-metadata";

export const metadata = siteMetadata("en");

export default function EnglishHomePage() {
  return (
    <I18nProvider locale="en">
      {/* Kök layout <html lang="tr"> üretir; belge dilini hidrasyondan önce düzelt. */}
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.lang="en"' }} />
      <BuilderLoader />
    </I18nProvider>
  );
}
