import * as XLSX from 'xlsx';

interface TemplateColumn {
  header: string;
  key: string;
  width: number;
  example: string | number;
}

interface TemplateConfig {
  sheetName: string;
  title: string;
  columns: TemplateColumn[];
  sampleData: Record<string, string | number>[];
  instructions?: string[];
}

// Template configurations for each module
const templateConfigs: Record<string, TemplateConfig> = {
  'balance-sheet': {
    sheetName: 'Balance General',
    title: 'Plantilla de Balance General',
    columns: [
      { header: 'Codigo Cuenta', key: 'codigo_cuenta', width: 15, example: '1000' },
      { header: 'Nombre Cuenta', key: 'nombre_cuenta', width: 30, example: 'Caja y Bancos' },
      { header: 'Tipo Cuenta', key: 'tipo_cuenta', width: 15, example: 'activo' },
      { header: 'Monto', key: 'monto', width: 15, example: 150000 },
      { header: 'Cuenta Padre', key: 'cuenta_padre', width: 15, example: '' },
    ],
    sampleData: [
      { codigo_cuenta: '1000', nombre_cuenta: 'Caja y Bancos', tipo_cuenta: 'activo', monto: 150000, cuenta_padre: '' },
      { codigo_cuenta: '1001', nombre_cuenta: 'Caja Chica', tipo_cuenta: 'activo', monto: 5000, cuenta_padre: '1000' },
      { codigo_cuenta: '1002', nombre_cuenta: 'Bancos', tipo_cuenta: 'activo', monto: 145000, cuenta_padre: '1000' },
      { codigo_cuenta: '1100', nombre_cuenta: 'Cuentas por Cobrar', tipo_cuenta: 'activo', monto: 85000, cuenta_padre: '' },
      { codigo_cuenta: '1200', nombre_cuenta: 'Inventarios', tipo_cuenta: 'activo', monto: 120000, cuenta_padre: '' },
      { codigo_cuenta: '1300', nombre_cuenta: 'Activos Fijos', tipo_cuenta: 'activo', monto: 350000, cuenta_padre: '' },
      { codigo_cuenta: '2000', nombre_cuenta: 'Cuentas por Pagar', tipo_cuenta: 'pasivo', monto: 75000, cuenta_padre: '' },
      { codigo_cuenta: '2100', nombre_cuenta: 'Prestamos Bancarios', tipo_cuenta: 'pasivo', monto: 200000, cuenta_padre: '' },
      { codigo_cuenta: '2200', nombre_cuenta: 'Obligaciones Laborales', tipo_cuenta: 'pasivo', monto: 45000, cuenta_padre: '' },
      { codigo_cuenta: '3000', nombre_cuenta: 'Capital Social', tipo_cuenta: 'patrimonio', monto: 250000, cuenta_padre: '' },
      { codigo_cuenta: '3100', nombre_cuenta: 'Reservas', tipo_cuenta: 'patrimonio', monto: 80000, cuenta_padre: '' },
      { codigo_cuenta: '3200', nombre_cuenta: 'Resultados del Ejercicio', tipo_cuenta: 'patrimonio', monto: 60000, cuenta_padre: '' },
    ],
    instructions: [
      'Tipos de cuenta validos: activo, pasivo, patrimonio',
      'El campo cuenta_padre es opcional (para subcuentas)',
      'Los montos deben ser numeros positivos',
    ],
  },
  'cash-flow': {
    sheetName: 'Flujo de Caja',
    title: 'Plantilla de Flujo de Caja',
    columns: [
      { header: 'Tipo Actividad', key: 'tipo_actividad', width: 18, example: 'operacion' },
      { header: 'Descripcion', key: 'descripcion', width: 40, example: 'Cobros de clientes' },
      { header: 'Monto', key: 'monto', width: 15, example: 450000 },
    ],
    sampleData: [
      { tipo_actividad: 'operacion', descripcion: 'Cobros de clientes', monto: 450000 },
      { tipo_actividad: 'operacion', descripcion: 'Pagos a proveedores', monto: -180000 },
      { tipo_actividad: 'operacion', descripcion: 'Pagos de salarios', monto: -120000 },
      { tipo_actividad: 'operacion', descripcion: 'Pagos de servicios publicos', monto: -25000 },
      { tipo_actividad: 'operacion', descripcion: 'Pagos de impuestos', monto: -35000 },
      { tipo_actividad: 'inversion', descripcion: 'Compra de equipos', monto: -50000 },
      { tipo_actividad: 'inversion', descripcion: 'Venta de activos', monto: 15000 },
      { tipo_actividad: 'financiamiento', descripcion: 'Prestamo bancario recibido', monto: 100000 },
      { tipo_actividad: 'financiamiento', descripcion: 'Pago de intereses', monto: -12000 },
      { tipo_actividad: 'financiamiento', descripcion: 'Pago de dividendos', monto: -20000 },
    ],
    instructions: [
      'Tipos de actividad validos: operacion, inversion, financiamiento',
      'Montos positivos = entradas de efectivo',
      'Montos negativos = salidas de efectivo',
    ],
  },
  'membership-fees': {
    sheetName: 'Cuotas de Socios',
    title: 'Plantilla de Cuotas de Socios',
    columns: [
      { header: 'ID Socio', key: 'id_socio', width: 12, example: 'SOC001' },
      { header: 'Nombre Socio', key: 'nombre_socio', width: 25, example: 'Juan Perez Garcia' },
      { header: 'Email', key: 'email', width: 28, example: 'juan.perez@email.com' },
      { header: 'Tipo Cuota', key: 'tipo_cuota', width: 12, example: 'mensual' },
      { header: 'Monto Esperado', key: 'monto_esperado', width: 15, example: 500 },
      { header: 'Monto Pagado', key: 'monto_pagado', width: 14, example: 500 },
      { header: 'Fecha Pago', key: 'fecha_pago', width: 12, example: '2024-01-15' },
      { header: 'Estado', key: 'estado', width: 10, example: 'pagado' },
    ],
    sampleData: [
      { id_socio: 'SOC001', nombre_socio: 'Juan Perez Garcia', email: 'juan.perez@email.com', tipo_cuota: 'mensual', monto_esperado: 500, monto_pagado: 500, fecha_pago: '2024-01-15', estado: 'pagado' },
      { id_socio: 'SOC002', nombre_socio: 'Maria Rodriguez Lopez', email: 'maria.rodriguez@email.com', tipo_cuota: 'mensual', monto_esperado: 500, monto_pagado: 500, fecha_pago: '2024-01-10', estado: 'pagado' },
      { id_socio: 'SOC003', nombre_socio: 'Carlos Sanchez Mora', email: 'carlos.sanchez@email.com', tipo_cuota: 'mensual', monto_esperado: 500, monto_pagado: 250, fecha_pago: '2024-01-20', estado: 'parcial' },
      { id_socio: 'SOC004', nombre_socio: 'Ana Martinez Vega', email: 'ana.martinez@email.com', tipo_cuota: 'mensual', monto_esperado: 500, monto_pagado: 0, fecha_pago: '', estado: 'pendiente' },
      { id_socio: 'SOC005', nombre_socio: 'Pedro Gonzalez Ruiz', email: 'pedro.gonzalez@email.com', tipo_cuota: 'mensual', monto_esperado: 500, monto_pagado: 500, fecha_pago: '2024-01-05', estado: 'pagado' },
      { id_socio: 'SOC006', nombre_socio: 'Laura Fernandez Silva', email: 'laura.fernandez@email.com', tipo_cuota: 'mensual', monto_esperado: 500, monto_pagado: 300, fecha_pago: '2024-01-18', estado: 'parcial' },
      { id_socio: 'SOC007', nombre_socio: 'Roberto Castro Jimenez', email: 'roberto.castro@email.com', tipo_cuota: 'mensual', monto_esperado: 500, monto_pagado: 0, fecha_pago: '', estado: 'atrasado' },
      { id_socio: 'SOC008', nombre_socio: 'Carmen Diaz Herrera', email: 'carmen.diaz@email.com', tipo_cuota: 'mensual', monto_esperado: 500, monto_pagado: 500, fecha_pago: '2024-01-12', estado: 'pagado' },
    ],
    instructions: [
      'Estados validos: pagado, parcial, pendiente, atrasado',
      'Formato de fecha: YYYY-MM-DD (ej: 2024-01-15)',
      'Deje fecha_pago vacio si no hay pago',
    ],
  },
  'ratios': {
    sheetName: 'Ratios Financieros',
    title: 'Plantilla de Ratios Financieros',
    columns: [
      { header: 'Nombre Ratio', key: 'nombre_ratio', width: 28, example: 'Ratio Corriente' },
      { header: 'Valor', key: 'valor', width: 12, example: 1.85 },
      { header: 'Tendencia', key: 'tendencia', width: 12, example: 'up' },
      { header: 'Descripcion', key: 'descripcion', width: 45, example: 'Activo corriente / Pasivo corriente' },
    ],
    sampleData: [
      { nombre_ratio: 'Ratio Corriente', valor: 1.85, tendencia: 'up', descripcion: 'Activo corriente / Pasivo corriente' },
      { nombre_ratio: 'Deuda sobre Activos', valor: 0.42, tendencia: 'down', descripcion: 'Total pasivos / Total activos' },
      { nombre_ratio: 'Rentabilidad del Patrimonio', valor: 0.125, tendencia: 'up', descripcion: 'Ingreso neto / Patrimonio total' },
      { nombre_ratio: 'Margen Operativo', valor: 0.18, tendencia: 'stable', descripcion: 'Ingreso operativo / Ingresos totales' },
      { nombre_ratio: 'Rotacion de Inventarios', valor: 4.5, tendencia: 'up', descripcion: 'Costo de ventas / Inventario promedio' },
      { nombre_ratio: 'Dias de Cobro', valor: 35, tendencia: 'down', descripcion: 'Cuentas por cobrar * 365 / Ventas' },
      { nombre_ratio: 'Liquidez Inmediata', valor: 0.95, tendencia: 'stable', descripcion: '(Activo corriente - Inventarios) / Pasivo corriente' },
      { nombre_ratio: 'Endeudamiento Patrimonial', valor: 0.72, tendencia: 'down', descripcion: 'Total pasivos / Patrimonio' },
    ],
    instructions: [
      'Tendencias validas: up (subiendo), down (bajando), stable (estable)',
      'Los valores deben ser numericos',
      'La descripcion explica como se calcula el ratio',
    ],
  },
};

export function generateExcelTemplate(moduleId: string): void {
  const config = templateConfigs[moduleId];
  if (!config) {
    console.error(`Unknown module: ${moduleId}`);
    return;
  }

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();

  // Build data array with headers and sample data
  const wsData: (string | number)[][] = [];

  // Add title row
  wsData.push([config.title]);
  wsData.push([]); // Empty row

  // Add instructions
  if (config.instructions) {
    wsData.push(['INSTRUCCIONES:']);
    config.instructions.forEach(instruction => {
      wsData.push([`  - ${instruction}`]);
    });
    wsData.push([]); // Empty row
  }

  // Add header row with column keys (this is what the system expects)
  wsData.push(['COLUMNAS REQUERIDAS (use estos nombres exactos):']);
  wsData.push(config.columns.map(col => col.key));
  wsData.push([]); // Empty row

  // Add header row with friendly names
  wsData.push(['DATOS DE EJEMPLO:']);
  wsData.push(config.columns.map(col => col.header));

  // Add sample data
  config.sampleData.forEach(row => {
    wsData.push(config.columns.map(col => row[col.key] ?? ''));
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = config.columns.map(col => ({ wch: col.width }));

  // Merge title cell across all columns
  const numCols = config.columns.length;
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } }, // Title row
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, config.sheetName);

  // Generate and download file
  const fileName = `plantilla-${moduleId}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function getTemplateInfo(moduleId: string) {
  return templateConfigs[moduleId];
}
