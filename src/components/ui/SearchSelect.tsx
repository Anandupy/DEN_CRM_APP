'use client';
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

export interface SearchOption {
  id: string;
  label: string;
  helper?: string;
}

export default function SearchSelect({
  label,
  placeholder,
  value,
  onSelect,
  search,
  disabled = false,
  minChars = 2,
  loadingText = 'Searching...',
  emptyText = 'No matches found.',
  minCharsText,
}: {
  label: string;
  placeholder: string;
  value: SearchOption | null;
  onSelect: (option: SearchOption) => void;
  search: (query: string) => Promise<SearchOption[]>;
  disabled?: boolean;
  minChars?: number;
  loadingText?: string;
  emptyText?: string;
  minCharsText?: string;
}) {
  const [query, setQuery] = useState(value?.label ?? '');
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(value?.label ?? '');
  }, [value]);

  useEffect(() => {
    if (disabled) {
      setOptions([]);
      setOpen(false);
      setLoading(false);
      setError(null);
      return;
    }

    if (query.trim().length < minChars) {
      setOptions([]);
      setOpen(false);
      setLoading(false);
      setError(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await search(query);
        setOptions(result);
        setOpen(true);
      } catch (searchError) {
        setOptions([]);
        setOpen(true);
        setError(searchError instanceof Error ? searchError.message : 'Unable to search right now.');
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [disabled, minChars, query, search]);

  return (
    <div className="relative">
      <label className="form-label">{label}</label>
      <div className="relative mt-1.5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (options.length) setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="form-input pl-9 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
      {open && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="px-3 py-3 text-sm text-zinc-500">{loadingText}</div>
          ) : error ? (
            <div className="px-3 py-3 text-sm text-red-400">{error}</div>
          ) : options.length ? (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setQuery(option.label);
                  setOpen(false);
                }}
                className="w-full px-3 py-3 text-left hover:bg-zinc-800 transition-colors"
              >
                <p className="text-sm text-zinc-200 font-medium">{option.label}</p>
                {option.helper ? <p className="text-xs text-zinc-500 mt-0.5">{option.helper}</p> : null}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-zinc-500">
              {query.trim().length < minChars
                ? (minCharsText ?? `Type at least ${minChars} letters to search.`)
                : emptyText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
