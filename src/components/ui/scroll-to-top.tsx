import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp } from "@/components/icons";
import { Button } from "@/components/ui/button";

const SCROLL_THRESHOLD = 300;

export function ScrollToTop() {
  const { t } = useTranslation("common");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      variant="outline"
      size="icon-lg"
      onClick={scrollToTop}
      className="zn-scroll-top"
      data-visible={isVisible ? "true" : "false"}
      aria-label={t("actions.scrollToTop")}
    >
      <ArrowUp />
    </Button>
  );
}
