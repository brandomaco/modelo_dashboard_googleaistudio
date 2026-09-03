import React from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  RotateCcw, 
  Table as TableIcon, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { SheetInfo } from '../types';

interface NavbarProps {
  fileName: string;
  isCustomFile: boolean;
  sheets: SheetInfo[];
  currentSheet: string;
  onSheetChange: (sheetName: string) => void;
  onOpenUpload: () => void;
  onResetData: () => void;
  onToggleTable: () => void;
  isTableOpen: boolean;
  recordCount: number;
  onExportCSV: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  fileName,
  isCustomFile,
  sheets,
  currentSheet,
  onSheetChange,
  onOpenUpload,
  onResetData,
  onToggleTable,
  isTableOpen,
  recordCount,
  onExportCSV,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Dataset Status */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Dashboard de Control & Insights
              </h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                isCustomFile 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {isCustomFile ? 'Excel Personalizado' : 'Dataset Modelo'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
              <span className="font-mono text-slate-300">{fileName}</span>
              <span>•</span>
              <span>{recordCount.toLocaleString()} registros analizados</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Multiple Sheets Selector if available */}
          {sheets.length > 1 && (
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <label htmlFor="sheet-select" className="sr-only">Hoja</label>
              <select
                id="sheet-select"
                value={currentSheet}
                onChange={(e) => onSheetChange(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                {sheets.map((s) => (
                  <option key={s.name} value={s.name} className="bg-slate-800 text-white">
                    Hoja: {s.name} ({s.rowCount} filas)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset button if custom file loaded */}
          {isCustomFile && (
            <button
              onClick={onResetData}
              title="Restablecer al conjunto de datos modelo"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          )}

          {/* Table view toggle */}
          <button
            onClick={onToggleTable}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isTableOpen
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{isTableOpen ? 'Ocultar Tabla' : 'Ver Registros'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {/* Upload Excel Button */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Cargar Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
