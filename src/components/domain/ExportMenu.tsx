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
import { exportToICS, exportToPNG, exportToPDF, exportToFIT } from "@/lib/export";
import type { WorkoutTemplate } from "@/types";

interface ExportMenuProps {
  workout: WorkoutTemplate;
}

export function ExportMenu({ workout }: ExportMenuProps) {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [renderForExport, setRenderForExport] = useState(false);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const handleICSClick = () => {
    setShowDatePicker(true);
  };

  const handleICSExport = async (dateTime: Date) => {
    setShowDatePicker(false);
    setIsExporting(true);
    try {
      await exportToICS(workout, dateTime, isEn);
    } catch (error) {
      console.error("ICS export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePNGExport = useCallback(async () => {
    setIsExporting(true);
    setRenderForExport(true);

    // Wait for next frame to ensure component is rendered
    await new Promise((resolve) => requestAnimationFrame(resolve));
    // Additional delay for complex components
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      if (exportCardRef.current) {
        await exportToPNG(exportCardRef.current, workout.id);
      } else {
        throw new Error("Export card not rendered");
      }
    } catch (error) {
      console.error("PNG export failed:", error);
    } finally {
      setRenderForExport(false);
      setIsExporting(false);
    }
  }, [workout.id]);

  const handlePDFExport = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(workout, isEn);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFITExport = async () => {
    setIsExporting(true);
    try {
      await exportToFIT(workout);
    } catch (error) {
      console.error("FIT export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Download className="size-4 mr-2" />
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
