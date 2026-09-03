import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DataRecord } from '../types';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (buffer: ArrayBuffer, fileName: string) => void;
  currentRecords: DataRecord[];
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onFileUpload,
  currentRecords,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMsg('Por favor selecciona un archivo de formato Excel (.xlsx, .xls) o CSV (.csv).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        onFileUpload(buffer, file.name);
        onClose();
      } else {
        setErrorMsg('Error al leer el archivo. Intenta de nuevo.');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Ocurrió un error al procesar el archivo seleccionado.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Allow user to download the sample dataset as an actual Excel file
  const handleDownloadSampleExcel = () => {
    const exportData = currentRecords.map((r) => ({
      Fecha: r.date,
      Categoria: r.category,
      Producto: r.product,
      Region: r.region,
      Canal: r.channel,
      SegmentoCliente: r.customerSegment,
      Facturacion_USD: r.revenue,
      Costo_USD: r.cost,
      Beneficio_USD: r.profit,
      Unidades: r.units,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos_Analisis');
    XLSX.writeFile(workbook, 'Dataset_Comercial_Modelo.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cargar Archivo Excel</h3>
            <p className="text-xs text-slate-500">
              Analiza tus datos y genera KPIs, insights y patrones al instante
            </p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold text-slate-800">
            Arrastra tu archivo aquí o <span className="text-blue-600 underline">haz clic para explorar</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Compatible con Microsoft Excel (.xlsx, .xls) y archivos .CSV
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[11px] text-slate-500">
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">Detección automática de columnas</span>
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">Múltiples hojas</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Helper info & Download Sample */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="text-slate-500 flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Procesamiento 100% privado en navegador</span>
          </div>

          <button
            type="button"
            onClick={handleDownloadSampleExcel}
            className="inline-flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-medium hover:underline self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar archivo modelo .xlsx</span>
          </button>
        </div>
      </div>
    </div>
  );
};
