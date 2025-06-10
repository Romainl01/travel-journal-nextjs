import React, { useState, useEffect, useRef } from 'react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: { name: string; lat: number; lon: number }) => void;
  placeholder?: string;
}

const fetchSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'en',
      'User-Agent': 'travel-journal-app/1.0 (your@email.com)',
    },
  });
  if (!res.ok) return [];
  return res.json();
};

export default function LocationAutocomplete({ value, onChange, placeholder }: LocationAutocompleteProps) {
  const [input, setInput] = useState(value || '');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const justSelected = useRef(false);
  const userInputRef = useRef(false);

  useEffect(() => {
    setInput(value || '');
  }, [value]);

  useEffect(() => {
    if (!input) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await fetchSuggestions(input);
      setSuggestions(results);
      setLoading(false);
      if (userInputRef.current) {
        setOpen(true);
      }
      userInputRef.current = false;
    }, 400);
    // eslint-disable-next-line
  }, [input]);

  const handleSelect = (suggestion: LocationSuggestion) => {
    setInput(suggestion.display_name);
    setOpen(false);
    justSelected.current = true;
    onChange({
      name: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    });
  };

  const handleFocus = () => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    if (input) setOpen(true);
  };

  const handleInputChange = (val: string) => {
    userInputRef.current = true;
    setInput(val);
  };

  return (
    <div className="relative">
      <Command shouldFilter={false} className="bg-white border rounded-md shadow-sm">
        <CommandInput
          value={input}
          onValueChange={handleInputChange}
          placeholder={placeholder || 'Search for a location...'}
          onFocus={handleFocus}
          autoComplete="off"
        />
        {open && (
          <CommandList className="absolute left-0 top-full w-full z-10 bg-white border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
            {loading && <div className="p-2 text-sm text-gray-500">Loading...</div>}
            {!loading && suggestions.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {!loading && suggestions.map((s, i) => (
              <CommandItem
                key={s.display_name + i}
                value={s.display_name}
                onSelect={() => handleSelect(s)}
              >
                {s.display_name}
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>
    </div>
  );
} 