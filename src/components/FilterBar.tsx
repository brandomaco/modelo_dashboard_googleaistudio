import React, { useState } from 'react';
import { FilterState } from '../types';
import { Search, RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  categories: string[];
  regions: string[];
  channels: string[];
  totalRecords: number;
  filteredRecordsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  categories,
  regions,
  channels,
  totalRecords,
  filteredRecordsCount,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const isSecondaryActive = filters.region !== 'all' || filters.channel !== 'all';
  const isFiltered =
    filters.period !== 'all' ||
    filters.category !== 'all' ||
    filters.region !== 'all' ||
    filters.channel !== 'all' ||
    filters.searchQuery.trim() !== '';

  const handleReset = () => {
    onFilterChange({
      period: 'all',
      category: 'all',
      region: 'all',
      channel: 'all',
      searchQuery: '',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Quick Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar producto, categoría..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Primary Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <div className="flex items-center text-xs">
            <span className="text-slate-400 mr-1.5 hidden sm:inline">Periodo:</span>
            <select
              value={filters.period}
              onChange={(e) => onFilterChange({ period: e.target.value as FilterState['period'] })}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todo el Año</option>
              <option value="Q1">Q1 (Ene - Mar)</option>
              <option value="Q2">Q2 (Abr - Jun)</option>
              <option value="Q3">Q3 (Jul - Sep)</option>
              <option value="Q4">Q4 (Oct - Dic)</option>
              <option value="H1">1er Semestre</option>
              <option value="H2">2do Semestre</option>
            </select>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center text-xs">
              <select
                value={filters.category}
                onChange={(e) => onFilterChange({ category: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Toggle More Filters Button */}
          <button
            onClick={() => setShowAdvanced((prev) => !prev)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition flex items-center gap-1 ${
              showAdvanced || isSecondaryActive
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Filtros {isSecondaryActive && '•'}</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              onClick={handleReset}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
              title="Limpiar todos los filtros"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          )}

          {/* Count Badge */}
          <div className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 ml-auto md:ml-0">
            {filteredRecordsCount} / {totalRecords} filas
          </div>
        </div>
      </div>

      {/* Collapsible Secondary Filters */}
      {(showAdvanced || isSecondaryActive) && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 animate-in fade-in">
          <span className="text-xs text-slate-500 font-medium mr-1">Filtros avanzados:</span>
          {/* Region Filter */}
          {regions.length > 0 && (
            <select
              value={filters.region}
              onChange={(e) => onFilterChange({ region: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas las Regiones</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}

          {/* Channel Filter */}
          {channels.length > 0 && (
            <select
              value={filters.channel}
              onChange={(e) => onFilterChange({ channel: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos los Canales</option>
              {channels.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
};
