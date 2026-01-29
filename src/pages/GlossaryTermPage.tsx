// src/pages/GlossaryTermPage.tsx
// Detail page for a single glossary term

import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Book, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GlossaryDetail } from "@/components/domain";
import { getTermById } from "@/data/glossary";

export function GlossaryTermPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("glossary");

  const term = id ? getTermById(id) : undefined;

  if (!term) {
    return (
      <div className="py-8">
        <EmptyState
          icon={Search}
          title={t("termNotFound")}
          description={t("termNotFoundDescription")}
          action={
            <Button variant="link" asChild>
              <Link to="/glossary">{t("backToGlossary")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-1 -ml-2">
          <Link to="/glossary">
            <ChevronLeft className="h-4 w-4" />
            <Book className="h-4 w-4 mr-1" />
            {t("backToGlossary")}
          </Link>
        </Button>
      </div>

      {/* Term Detail */}
      <div className="max-w-3xl">
        <GlossaryDetail term={term} />
      </div>
    </div>
  );
}

export default GlossaryTermPage;
