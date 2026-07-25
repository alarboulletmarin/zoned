/**
 * ExportMenu - Dropdown menu for workout export options
 *
 * Provides 4 export formats:
 * - Calendar (ICS)
 * - Image (PNG) - Full workout card with all info
 * - Document (PDF)
 * - Garmin (FIT)
 */

import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Download, Calendar, Image, FileText, Watch, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportDatePicker } from "./ExportDatePicker";
import { ExportableWorkoutCard } from "./ExportableWorkoutCard";
import { FitTransferGuide } from "./FitTransferGuide";
import { exportToICS, exportToPNG, exportToPDF, exportToFIT } from "@/lib/export";
import { toast } from "sonner";
import type { WorkoutTemplate } from "@/types";
import { cn } from "@/lib/utils";

interface ExportMenuProps {
  workout: WorkoutTemplate;
  /** Applied to the trigger button, e.g. to stretch it as a primary CTA. */
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function ExportMenu({ workout, className, size = "sm" }: ExportMenuProps) {
  const { t } = useTranslation("common");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFitGuide, setShowFitGuide] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [renderForExport, setRenderForExport] = useState(false);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const handleICSClick = () => {
    setShowDatePicker(true);
  };

  const handleICSExport = async (dateTime: Date) => {
    setShowDatePicker(false);
    setIsExporting(true);
    const toastId = toast.loading(t("export.loading.calendar", t("export.title")));
    try {
      await exportToICS(workout, dateTime);
      toast.success(t("export.success.calendar"), { id: toastId });
    } catch (error) {
      toast.error(t("export.error.calendar"), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePNGExport = useCallback(async () => {
    setIsExporting(true);
    setRenderForExport(true);
    const toastId = toast.loading(t("export.loading.image", t("export.title")));

    // Wait for next frame to ensure component is rendered
    await new Promise((resolve) => requestAnimationFrame(resolve));
    // Additional delay for complex components
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      if (exportCardRef.current) {
        await exportToPNG(exportCardRef.current, workout.id);
        toast.success(t("export.success.image"), { id: toastId });
      } else {
        throw new Error("Export card not rendered");
      }
    } catch (error) {
      toast.error(t("export.error.image"), { id: toastId });
    } finally {
      setRenderForExport(false);
      setIsExporting(false);
    }
  }, [workout.id, t]);

  const handlePDFExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading(t("export.loading.pdf", t("export.title")));
    try {
      await exportToPDF(workout);
      toast.success(t("export.success.pdf"), { id: toastId });
    } catch (error) {
      toast.error(t("export.error.pdf"), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFITExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading(t("export.loading.garmin", t("export.title")));
    try {
      await exportToFIT(workout);
      toast.success(t("export.success.garmin"), { id: toastId });
      setShowFitGuide(true);
    } catch (error) {
      toast.error(t("export.error.garmin"), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size={size}
            disabled={isExporting}
            className={cn("rounded-full px-4", className)}
          >
            {isExporting ? (
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="size-3.5 mr-1.5" />
            )}
            {t("export.title")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleICSClick}>
            <Calendar className="size-4" />
            {t("export.calendar")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePNGExport}>
            <Image className="size-4" />
            {t("export.image")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePDFExport}>
            <FileText className="size-4" />
            {t("export.pdf")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFITExport}>
            <Watch className="size-4" />
            {t("export.garmin")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showDatePicker && (
        <ExportDatePicker
          onSelect={handleICSExport}
          onCancel={() => setShowDatePicker(false)}
        />
      )}

      <FitTransferGuide
        open={showFitGuide}
        onOpenChange={setShowFitGuide}
        workout={workout}
      />

      {/* Hidden export card for PNG capture */}
      {renderForExport && (
        <div
          style={{
            position: "fixed",
            left: "-9999px",
            top: 0,
            zIndex: -1,
          }}
        >
          <ExportableWorkoutCard ref={exportCardRef} workout={workout} />
        </div>
      )}
    </>
  );
}
