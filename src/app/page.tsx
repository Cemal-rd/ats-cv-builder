import { BuilderLoader } from "@/components/builder/builder-loader";
import { UiLocaleRedirect } from "@/components/i18n/ui-locale-redirect";
import { I18nProvider } from "@/i18n/provider";

export default function HomePage() {
  return (
    <I18nProvider locale="tr">
      <UiLocaleRedirect>
        <BuilderLoader />
      </UiLocaleRedirect>
    </I18nProvider>
  );
}
