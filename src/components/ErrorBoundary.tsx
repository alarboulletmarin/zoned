import { Component } from "react";
import type { CSSProperties, ReactNode, ErrorInfo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * The screen of last resort: it exists because a page threw.
 *
 * It follows the system's rule for an error, the one NotFoundPage and Alert
 * already apply, say what happened, then give the way out. The third beat that
 * rule asks for, *what is still intact*, has no key under `errors.boundary`:
 * the 404 says "tes plans, tes séances et tes réglages sont intacts" and this
 * screen owes the same reassurance. Copy debt, not layout debt.
 *
 * And it carries nothing that could throw in turn, no Alert, no icon, no
 * drawing, no page stylesheet. React has no boundary above this one, so a
 * fallback that crashes takes the whole app down with it. `Button` stays
 * because it is a native `<button>` plus a class name.
 */
function ErrorFallback() {
  const { t } = useTranslation("common");

  return (
    <div className="zn-crash">
      <h1 className="zn-display" data-level="3">
        {t("errors.boundary.title")}
      </h1>
      <p className="zn-body zn-body--lead">
        {t("errors.boundary.description")}
      </p>
      <div
        className="zn-cluster"
        style={{ "--gap": "var(--sp-6)" } as CSSProperties}
      >
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t("errors.boundary.reload")}
        </Button>
        <Button onClick={() => (window.location.href = "/")}>
          {t("errors.boundary.backHome")}
        </Button>
      </div>
    </div>
  );
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
}
