import React, { useState, useMemo } from 'react';
import { DataRecord } from '../types';
import { 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Search, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface DataTableProps {
  records: DataRecord[];
  onClose: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ records, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof DataRecord>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const handleSort = (field: keyof DataRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = records;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.product.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q) ||
          r.channel.toLowerCase().includes(q) ||
          r.customerSegment.toLowerCase().includes(q) ||
          r.date.includes(q)
      );
    }

    return [...list].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }

      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [records, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  const exportCurrentTableToExcel = () => {
    const exportRows = filteredAndSorted.map((r) => ({
      ID: r.id,
      Fecha: r.date,
      Producto: r.product,
      Categoria: r.category,
      Region: r.region,
      Canal: r.channel,
      Segmento: r.customerSegment,
      Facturacion_USD: r.revenue,
      Costo_USD: r.cost,
      Beneficio_USD: r.profit,
      Margen_Pct: r.revenue > 0 ? `${Math.round((r.profit / r.revenue) * 100)}%` : '0%',
      Unidades: r.units,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos_Filtrados');
    XLSX.writeFile(workbook, 'Registros_Filtrados_Dashboard.xlsx');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Explorador de Registros del Dataset
            </h3>
            <p className="text-xs text-slate-500">
              Consulta, ordena y filtra cada fila individual analizada en el archivo
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCurrentTableToExcel}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Vista (.xlsx)</span>
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            title="Cerrar vista de tabla"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar en esta tabla..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Mostrando <strong>{paginatedRows.length}</strong> de <strong>{filteredAndSorted.length}</strong> filas
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold select-none">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Fecha</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('product')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Producto</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('category')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Categoría</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('region')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Región</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('channel')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Canal</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('units')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Uds</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('revenue')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Facturación</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('profit')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Beneficio</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Margen %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No se encontraron registros con los filtros actuales
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => {
                const margin = row.revenue > 0 ? Math.round((row.profit / row.revenue) * 100) : 0;
                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{row.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">{row.product}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{row.region}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{row.channel}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{row.units}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 whitespace-nowrap">
                      {formatCurrency(row.profit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        margin >= 50 ? 'bg-emerald-50 text-emerald-700' : margin < 30 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {margin}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>
          <span className="text-slate-500 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
