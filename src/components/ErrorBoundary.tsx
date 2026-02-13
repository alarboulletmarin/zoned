import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

function ErrorFallback() {
  const { t } = useTranslation("common");

  return (
    <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">{t("errors.boundary.title")}</h1>
      <p className="text-muted-foreground">
        {t("errors.boundary.description")}
      </p>
      <div className="flex gap-3">
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
