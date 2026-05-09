import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin, X } from "@/components/icons";
import { cn } from "@/lib/utils";
import { searchAddress, type GeocodeResult } from "@/lib/routeGenerator/geocoding";
import type { RouteCoordinate } from "@/types/route";

interface AddressSearchInputProps {
  onSelect: (point: RouteCoordinate, label: string) => void;
  onClear?: () => void;
  selectedLabel?: string | null;
  className?: string;
  /** Disable the input (e.g. while a GPS lookup is running). */
  disabled?: boolean;
}

const DEBOUNCE_MS = 600;

/**
 * Debounced address search box backed by Nominatim. Renders a dropdown of
 * up to 5 candidates and emits the selected `[lon, lat]` upstream.
 */
export function AddressSearchInput({
  onSelect,
  onClear,
  selectedLabel,
  className,
  disabled = false,
}: AddressSearchInputProps) {
  const { t } = useTranslation("routes");
  const [query, setQuery] = useState(selectedLabel ?? "");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync external selection (e.g. coming from GPS button) into the input.
  useEffect(() => {
    if (selectedLabel != null) setQuery(selectedLabel);
  }, [selectedLabel]);

  // Debounced search.
  useEffect(() => {
    if (!query || query === selectedLabel || query.length < 3) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setIsSearching(true);
      try {
        const found = await searchAddress({ query, signal: ctrl.signal });
        setResults(found);
        setOpen(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.warn("AddressSearchInput: search failed", err);
        }
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [query, selectedLabel]);

  // Close dropdown on click outside.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const handleSelect = (result: GeocodeResult) => {
    setQuery(result.label);
    setResults([]);
    setOpen(false);
    onSelect(result.point, result.label);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    onClear?.();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value !== selectedLabel) onClear?.();
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={t("form.addressPlaceholder")}
          disabled={disabled}
          className={cn(
            "w-full rounded-md border border-input bg-background py-2 pl-9 pr-9 text-base",
            "placeholder:text-muted-foreground",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-label={t("form.addressPlaceholder")}
          aria-autocomplete="list"
          aria-controls="address-suggestions"
          aria-expanded={open}
        />
        {isSearching ? (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : query.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {open && (results.length > 0 || (query.length >= 3 && !isSearching)) && (
        <ul
          id="address-suggestions"
          role="listbox"
          className="absolute left-0 right-0 z-[1200] mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-popover shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              {t("form.addressNoResults")}
            </li>
          ) : (
            results.map((result) => (
              <li key={`${result.point[0]}-${result.point[1]}`} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate">{result.label}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default AddressSearchInput;
