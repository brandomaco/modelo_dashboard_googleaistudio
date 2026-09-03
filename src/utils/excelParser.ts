import * as XLSX from 'xlsx';
import { DataRecord, SheetInfo } from '../types';

export interface ParseResult {
  records: DataRecord[];
  sheets: SheetInfo[];
  currentSheet: string;
  detectedColumns: Record<string, string>;
  fileName: string;
}

// Clean and parse numeric values that might contain currency symbols, commas, or spaces
export function cleanNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    // Remove symbols, convert European comma to dot if applicable
    let cleaned = val.replace(/[$€£¥\s]/g, '').trim();
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // e.g. 1,234.56 or 1.234,56
      if (cleaned.lastIndexOf('.') > cleaned.lastIndexOf(',')) {
        cleaned = cleaned.replace(/,/g, '');
      } else {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      }
    } else if (cleaned.includes(',')) {
      cleaned = cleaned.replace(',', '.');
    }
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

// Format date into standard YYYY-MM-DD
export function cleanDate(val: any): string {
  if (!val) return '2024-01-01';

  // If Excel numeric serial date (e.g., 44927)
  if (typeof val === 'number') {
    try {
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj) {
        const y = dateObj.y || 2024;
        const m = (dateObj.m || 1).toString().padStart(2, '0');
        const d = (dateObj.d || 1).toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } catch {
      // fallback
    }
  }

  const str = String(val).trim();
  // Check if standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }

  // DD/MM/YYYY or MM/DD/YYYY
  const slashParts = str.split(/[/.-]/);
  if (slashParts.length >= 3) {
    if (slashParts[0].length === 4) {
      // YYYY/MM/DD
      return `${slashParts[0]}-${slashParts[1].padStart(2, '0')}-${slashParts[2].padStart(2, '0')}`;
    }
    if (slashParts[2].length === 4) {
      // DD/MM/YYYY
      const day = parseInt(slashParts[0], 10);
      const month = parseInt(slashParts[1], 10);
      if (month <= 12 && day <= 31) {
        return `${slashParts[2]}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return '2024-06-15';
}

export function parseExcelBuffer(
  buffer: ArrayBuffer,
  fileName: string,
  targetSheetName?: string
): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetNames = workbook.SheetNames;
  const currentSheet = targetSheetName && sheetNames.includes(targetSheetName) ? targetSheetName : sheetNames[0];
  const worksheet = workbook.Sheets[currentSheet];

  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const sheets: SheetInfo[] = sheetNames.map((name) => {
    const ws = workbook.Sheets[name];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    return {
      name,
      rowCount: range.e.r - range.s.r + 1,
      columns: Object.keys(XLSX.utils.sheet_to_json(ws, { header: 1 })[0] || {}),
    };
  });

  if (rawRows.length === 0) {
    return {
      records: [],
      sheets,
      currentSheet,
      detectedColumns: {},
      fileName,
    };
  }

  // Detect column mapping based on common Spanish & English header aliases
  const firstRow = rawRows[0];
  const headers = Object.keys(firstRow);

  const findHeader = (patterns: RegExp[]): string | undefined => {
    return headers.find((h) => patterns.some((p) => p.test(h.toLowerCase().trim())));
  };

  const colDate = findHeader([/fecha/i, /date/i, /dia/i, /periodo/i, /mes/i, /timestamp/i, /time/i]);
  const colRev = findHeader([/venta/i, /revenue/i, /total/i, /monto/i, /ingreso/i, /importe/i, /facturacion/i, /facturación/i, /sales/i, /amount/i, /precio_total/i]);
  const colCost = findHeader([/costo/i, /cost/i, /gasto/i, /egreso/i, /cogs/i, /expenses/i]);
  const colProf = findHeader([/beneficio/i, /profit/i, /utilidad/i, /ganancia/i, /margen_neto/i, /resultado/i]);
  const colUnits = findHeader([/cantidad/i, /unidades/i, /units/i, /qty/i, /volumen/i, /piezas/i, /quantity/i]);
  const colCat = findHeader([/categoria/i, /categoría/i, /category/i, /linea/i, /departamento/i, /tipo_producto/i, /rubro/i]);
  const colProd = findHeader([/producto/i, /product/i, /item/i, /descripcion/i, /descripción/i, /articulo/i, /artículo/i, /nombre/i, /servicio/i]);
  const colReg = findHeader([/region/i, /región/i, /zona/i, /pais/i, /país/i, /ciudad/i, /sucursal/i, /territorio/i, /location/i]);
  const colChan = findHeader([/canal/i, /channel/i, /medio/i, /origen/i, /plataforma/i, /vía/i, /tipo_venta/i]);
  const colSeg = findHeader([/segmento/i, /segment/i, /cliente/i, /customer/i, /tipo_cliente/i, /perfil/i]);

  const detectedColumns: Record<string, string> = {
    date: colDate || 'Auto/Default',
    revenue: colRev || 'Auto',
    cost: colCost || 'Calculado',
    profit: colProf || 'Calculado',
    units: colUnits || 'Auto',
    category: colCat || 'Auto',
    product: colProd || 'Auto',
    region: colReg || 'Auto',
    channel: colChan || 'Auto',
    customerSegment: colSeg || 'Auto',
  };

  const records: DataRecord[] = rawRows.map((row, idx) => {
    const rawRev = colRev ? cleanNumber(row[colRev]) : 0;
    const rawCost = colCost ? cleanNumber(row[colCost]) : null;
    const rawProf = colProf ? cleanNumber(row[colProf]) : null;

    let revenue = rawRev;
    let cost = rawCost !== null ? rawCost : 0;
    let profit = rawProf !== null ? rawProf : 0;

    // Fallbacks if only some financial figures exist
    if (revenue > 0) {
      if (rawCost === null && rawProf !== null) {
        cost = Math.max(0, revenue - rawProf);
      } else if (rawCost !== null && rawProf === null) {
        profit = revenue - rawCost;
      } else if (rawCost === null && rawProf === null) {
        // Assume sensible commercial standard margin of 45%
        profit = Math.round(revenue * 0.45);
        cost = revenue - profit;
      }
    } else if (rawProf !== null && rawCost !== null) {
      revenue = rawProf + rawCost;
    }

    const units = colUnits ? Math.max(1, Math.round(cleanNumber(row[colUnits]))) : 1;
    const date = colDate ? cleanDate(row[colDate]) : `2024-${((idx % 12) + 1).toString().padStart(2, '0')}-15`;
    const category = colCat && row[colCat] ? String(row[colCat]).trim() : 'General';
    const product = colProd && row[colProd] ? String(row[colProd]).trim() : `Item ${idx + 1}`;
    const region = colReg && row[colReg] ? String(row[colReg]).trim() : 'Nacional / Central';
    const channel = colChan && row[colChan] ? String(row[colChan]).trim() : 'Directo';
    const customerSegment = colSeg && row[colSeg] ? String(row[colSeg]).trim() : 'Estándar';

    return {
      id: `EXCEL-${idx + 1}`,
      date,
      category,
      product,
      region,
      channel,
      customerSegment,
      revenue,
      cost,
      profit,
      units,
    };
  });

  return {
    records,
    sheets,
    currentSheet,
    detectedColumns,
    fileName,
  };
}
