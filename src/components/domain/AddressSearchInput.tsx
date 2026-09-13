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
    <div ref={containerRef} className={cn("zn-addr", className)}>
      <div className="zn-addr__box">
        <MapPin size={16} className="zn-addr__glyph" />
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
          className="zn-route-field zn-addr__input"
          aria-label={t("form.addressPlaceholder")}
          aria-autocomplete="list"
          aria-controls="address-suggestions"
          aria-expanded={open}
        />
        {isSearching ? (
          <Loader2 size={16} className="zn-addr__spinner" />
        ) : query.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t("common:actions.clear")}
            className="zn-addr__clear"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {open && (results.length > 0 || (query.length >= 3 && !isSearching)) && (
        <ul id="address-suggestions" role="listbox" className="zn-addr__list">
          {results.length === 0 ? (
            <li className="zn-addr__empty">{t("form.addressNoResults")}</li>
          ) : (
            results.map((result) => (
              <li key={`${result.point[0]}-${result.point[1]}`} role="option" aria-selected={false}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="zn-addr__option"
                >
                  <MapPin size={15} />
                  <span className="zn-addr__label zn-truncate">{result.label}</span>
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
