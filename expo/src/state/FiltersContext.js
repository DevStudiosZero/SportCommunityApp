import React, { createContext, useContext, useMemo, useState } from 'react';

const FiltersContext = createContext();

const initialFilters = {
  city: '',
  sports: [],
  dateFrom: null,
  dateTo: null,
  minDistance: null,
  maxDistance: null,
  levels: [] // e.g. ['Anfänger','Fortgeschritten','Pro']
};

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState(initialFilters);

  const value = useMemo(() => ({
    filters,
    setFilter: (key, value) => setFilters((prev) => ({ ...prev, [key]: value })),
    applyFilters: (next) => setFilters((prev) => ({ ...prev, ...next })),
    resetFilters: () => setFilters(initialFilters)
  }), [filters]);

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used within FiltersProvider');
  return ctx;
}