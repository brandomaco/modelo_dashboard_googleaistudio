import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { KPIGrid } from './components/KPIGrid';
import { InsightsPanel } from './components/InsightsPanel';
import { FilterBar } from './components/FilterBar';
import { PatternCharts } from './components/PatternCharts';
import { DataTable } from './components/DataTable';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { TriadRelationshipBar } from './components/TriadRelationshipBar';
import { RelationshipMatrixModal } from './components/RelationshipMatrixModal';
import { generateDefaultDataset } from './data/defaultDataset';
import { 
  filterRecords, 
  calculateKPIs, 
  getTimeSeriesData, 
  getCategoryAnalysis, 
  getChannelAndRegionData, 
  getProductMarginVolume, 
  generateAutomatedInsights 
} from './utils/dataAnalysis';
import { parseExcelBuffer } from './utils/excelParser';
import { DataRecord, FilterState, InsightItem, KPIKey, SheetInfo } from './types';
import * as XLSX from 'xlsx';
import { Sparkles, FileSpreadsheet, Upload, CheckCircle2, Layers } from 'lucide-react';

export default function App() {
  // State for loaded data
  const [records, setRecords] = useState<DataRecord[]>(() => generateDefaultDataset());
  const [fileName, setFileName] = useState<string>('Dataset_Comercial_Modelo.xlsx');
  const [isCustomFile, setIsCustomFile] = useState<boolean>(false);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [currentSheet, setCurrentSheet] = useState<string>('Hoja1');
  const [workbookBuffer, setWorkbookBuffer] = useState<ArrayBuffer | null>(null);

  // UI Modals & Toggles
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState<boolean>(false);
  const [isTableOpen, setIsTableOpen] = useState<boolean>(false);
  
  // Triad synchronization states: KPI ⇄ Insight ⇄ Chart
  const [highlightedChartId, setHighlightedChartId] = useState<string | null>(null);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [highlightedKpiId, setHighlightedKpiId] = useState<KPIKey | null>(null);
  const [selectedKpiId, setSelectedKpiId] = useState<KPIKey | null>(null);
  const [kpiFilter, setKpiFilter] = useState<KPIKey | 'all'>('all');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Global Filters
  const [filters, setFilters] = useState<FilterState>({
    period: 'all',
    category: 'all',
    region: 'all',
    channel: 'all',
    searchQuery: '',
    metricView: 'revenue',
  });

  // Extract unique categories, regions, and channels for filters
  const availableCategories = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.category))).filter(Boolean).sort();
  }, [records]);

  const availableRegions = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.region))).filter(Boolean).sort();
  }, [records]);

  const availableChannels = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.channel))).filter(Boolean).sort();
  }, [records]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return filterRecords(records, filters);
  }, [records, filters]);

  // Analytics derivations
  const kpis = useMemo(() => calculateKPIs(filteredRecords), [filteredRecords]);
  const timeSeriesData = useMemo(() => getTimeSeriesData(filteredRecords), [filteredRecords]);
  const categoryData = useMemo(() => getCategoryAnalysis(filteredRecords), [filteredRecords]);
  const { channels: channelData, regions: regionData } = useMemo(
    () => getChannelAndRegionData(filteredRecords),
    [filteredRecords]
  );
  const marginVolumeData = useMemo(() => getProductMarginVolume(filteredRecords), [filteredRecords]);
  const automatedInsights = useMemo(() => generateAutomatedInsights(filteredRecords), [filteredRecords]);

  // Active insight resolution
  const activeInsight = useMemo(() => {
    return automatedInsights.find((i) => i.id === selectedInsightId) || null;
  }, [automatedInsights, selectedInsightId]);

  // Update filter partially
  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  // Handle insight selection -> Triad synchronizer (KPI + Insight + Chart)
  const handleSelectInsight = useCallback((insight: InsightItem) => {
    setSelectedInsightId(insight.id);
    setHighlightedChartId(insight.targetChartId);
    setHighlightedKpiId(insight.targetKpiId);
    setSelectedKpiId(insight.targetKpiId);

    // Smooth scroll to the target chart
    const el = document.getElementById(insight.targetChartId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Handle KPI card click -> Synchronize with linked Insight and Chart
  const handleSelectKpi = useCallback((kpiKey: KPIKey) => {
    if (selectedKpiId === kpiKey) {
      // Toggle off
      setSelectedKpiId(null);
      setHighlightedKpiId(null);
      setSelectedInsightId(null);
      setHighlightedChartId(null);
      return;
    }

    setSelectedKpiId(kpiKey);
    setHighlightedKpiId(kpiKey);

    // Find the primary insight linked to this KPI
    const matchingInsight = automatedInsights.find((i) => i.targetKpiId === kpiKey);
    if (matchingInsight) {
      setSelectedInsightId(matchingInsight.id);
      setHighlightedChartId(matchingInsight.targetChartId);

      // Scroll to chart
      const chartEl = document.getElementById(matchingInsight.targetChartId);
      if (chartEl) {
        chartEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [automatedInsights, selectedKpiId]);

  // Scroll to KPI card in grid
  const handleFocusKpi = useCallback((kpiKey: KPIKey) => {
    setHighlightedKpiId(kpiKey);
    setSelectedKpiId(kpiKey);
    const kpiEl = document.getElementById(`kpi-${kpiKey}`);
    if (kpiEl) {
      kpiEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Scroll to Chart element
  const handleFocusChart = useCallback((chartId: string) => {
    setHighlightedChartId(chartId);
    const el = document.getElementById(chartId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Clear all triad selections
  const handleClearTriadSelection = useCallback(() => {
    setSelectedInsightId(null);
    setHighlightedChartId(null);
    setHighlightedKpiId(null);
    setSelectedKpiId(null);
  }, []);

  // Handle uploaded Excel file
  const handleFileUpload = (buffer: ArrayBuffer, uploadedName: string) => {
    try {
      const result = parseExcelBuffer(buffer, uploadedName);
      if (result.records.length > 0) {
        setWorkbookBuffer(buffer);
        setRecords(result.records);
        setFileName(result.fileName);
        setIsCustomFile(true);
        setSheets(result.sheets);
        setCurrentSheet(result.currentSheet);
        // Reset filters & triad
        handleClearTriadSelection();
        setFilters({
          period: 'all',
          category: 'all',
          region: 'all',
          channel: 'all',
          searchQuery: '',
          metricView: 'revenue',
        });
        setStatusNotification(`¡Archivo ${uploadedName} procesado con éxito! Se detectaron ${result.records.length} registros.`);
        setTimeout(() => setStatusNotification(null), 5000);
      } else {
        alert('No se encontraron registros de datos válidos en la hoja.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al procesar el archivo Excel. Asegúrate de que sea un archivo válido.');
    }
  };

  // Switch sheet
  const handleSheetChange = (sheetName: string) => {
    if (!workbookBuffer) return;
    try {
      const result = parseExcelBuffer(workbookBuffer, fileName, sheetName);
      setRecords(result.records);
      setCurrentSheet(sheetName);
      handleClearTriadSelection();
      setStatusNotification(`Cargada la hoja: ${sheetName}`);
      setTimeout(() => setStatusNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Reset to default sample dataset
  const handleResetData = () => {
    const defaultData = generateDefaultDataset();
    setRecords(defaultData);
    setFileName('Dataset_Comercial_Modelo.xlsx');
    setIsCustomFile(false);
    setSheets([]);
    setCurrentSheet('Hoja1');
    setWorkbookBuffer(null);
    handleClearTriadSelection();
    setFilters({
      period: 'all',
      category: 'all',
      region: 'all',
      channel: 'all',
      searchQuery: '',
      metricView: 'revenue',
    });
    setStatusNotification('Se ha restablecido el dataset modelo predeterminado.');
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Export current filtered dataset to CSV
  const handleExportCSV = () => {
    const exportRows = filteredRecords.map((r) => ({
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

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos_Exportados');
    XLSX.writeFile(workbook, `Reporte_${fileName.replace(/\.[^/.]+$/, '')}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <Navbar
        fileName={fileName}
        isCustomFile={isCustomFile}
        sheets={sheets}
        currentSheet={currentSheet}
        onSheetChange={handleSheetChange}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onResetData={handleResetData}
        onToggleTable={() => setIsTableOpen((prev) => !prev)}
        isTableOpen={isTableOpen}
        recordCount={records.length}
        onExportCSV={handleExportCSV}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Status Alert Banner if any */}
        {statusNotification && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-medium animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusNotification}</span>
            </div>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Clean Executive Header */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-blue-600 font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resumen Ejecutivo • Lectura Fácil</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Dashboard de Rendimiento Comercial
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Visualización simplificada: métricas clave consolidadas, conclusiones directas y gráficos enfocados por pestañas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMatrixModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Ver relaciones entre KPIs e Insights"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Matriz de Relaciones</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar Excel / CSV</span>
            </button>
          </div>
        </div>

        {/* Synchronized Triad Inspector Bar */}
        <TriadRelationshipBar
          activeInsight={activeInsight}
          selectedKpiId={selectedKpiId}
          onClear={handleClearTriadSelection}
          onFocusKpi={handleFocusKpi}
          onFocusChart={handleFocusChart}
          onToggleMatrixModal={() => setIsMatrixModalOpen(true)}
        />

        {/* 1. Executive KPI Cards with Click & Highlight synchronization */}
        <KPIGrid
          kpis={kpis}
          highlightedKpiId={highlightedKpiId}
          selectedKpiId={selectedKpiId}
          onSelectKpi={handleSelectKpi}
          activeInsight={activeInsight}
        />

        {/* 2. Interactive Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={availableCategories}
          regions={availableRegions}
          channels={availableChannels}
          totalRecords={records.length}
          filteredRecordsCount={filteredRecords.length}
        />

        {/* 3. Automated Insights Panel with KPI Filtering and Triad Badges */}
        <InsightsPanel
          insights={automatedInsights}
          selectedInsightId={selectedInsightId}
          onSelectInsight={handleSelectInsight}
          activeKpiFilter={kpiFilter}
          onFilterKpiChange={setKpiFilter}
        />

        {/* 4. Pattern Charts with Highlight sync & KPI connection badges */}
        <PatternCharts
          timeSeriesData={timeSeriesData}
          categoryData={categoryData}
          channelData={channelData}
          regionData={regionData}
          marginVolumeData={marginVolumeData}
          highlightedChartId={highlightedChartId}
          activeInsight={activeInsight}
          onSelectKpi={handleSelectKpi}
        />

        {/* 5. Optional Raw Data Explorer */}
        {isTableOpen && (
          <div id="table" className="pt-2">
            <DataTable
              records={filteredRecords}
              onClose={() => setIsTableOpen(false)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-12 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Dashboard Interactivo de KPIs e Insights • Análisis Basado en Excel</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMatrixModalOpen(true)}
              className="text-blue-600 hover:underline"
            >
              Matriz de Relaciones
            </button>
            <span>•</span>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="text-blue-600 hover:underline"
            >
              Cargar Archivo
            </button>
            <span>•</span>
            <button
              onClick={handleExportCSV}
              className="text-blue-600 hover:underline"
            >
              Descargar Informe
            </button>
          </div>
        </div>
      </footer>

      {/* Upload Modal */}
      <ExcelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileUpload={handleFileUpload}
        currentRecords={records}
      />

      {/* Relationship Matrix Modal */}
      <RelationshipMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        insights={automatedInsights}
        selectedInsightId={selectedInsightId}
        onSelectInsight={handleSelectInsight}
      />
    </div>
  );
}

