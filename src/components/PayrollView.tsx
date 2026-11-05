import React, { useState } from 'react';
import { DollarSign, Printer, Download, Search, Building, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Employee } from '../types/employee';
import { calculateSalaryTotals, formatCurrency } from '../utils/hrCalculations';
import { PrintPaySlipModal } from './PrintPaySlipModal';

interface PayrollViewProps {
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  employees,
  onSelectEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmpForSlip, setSelectedEmpForSlip] = useState<Employee | null>(null);

  // Compute institutional totals
  const aggregate = employees.reduce(
    (acc, emp) => {
      const t = calculateSalaryTotals(emp.salary);
      return {
        q1: acc.q1 + t.q1,
        q2: acc.q2 + t.q2,
        quincenas: acc.quincenas + t.totalQuincenas,
        cestaTicket: acc.cestaTicket + t.cestaTicket,
        bonoResponsabilidad: acc.bonoResponsabilidad + t.bonoResponsabilidad,
        bonoPuntualidad: acc.bonoPuntualidad + t.bonoPuntualidad,
        totalBonos: acc.totalBonos + t.totalBonos,
        totalAsignaciones: acc.totalAsignaciones + t.totalAsignaciones,
        totalDeducciones: acc.totalDeducciones + t.totalDeducciones,
        totalNeto: acc.totalNeto + t.netoTotal,
      };
    },
    {
      q1: 0,
      q2: 0,
      quincenas: 0,
      cestaTicket: 0,
      bonoResponsabilidad: 0,
      bonoPuntualidad: 0,
      totalBonos: 0,
      totalAsignaciones: 0,
      totalDeducciones: 0,
      totalNeto: 0,
    }
  );

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.idCard.includes(searchTerm) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = [
      'Cédula',
      'Nombres y Apellidos',
      'Cargo',
      'Departamento',
      'Quincena 1 (Bs)',
      'Quincena 2 (Bs)',
      'Cesta Ticket (Bs)',
      'Bono Responsabilidad (Bs)',
      'Bono Puntualidad (Bs)',
      'Total Asignaciones (Bs)',
      'Total Deducciones (Bs)',
      'Neto Mensual (Bs)',
    ];

    const rows = employees.map((emp) => {
      const t = calculateSalaryTotals(emp.salary);
      return [
        emp.idCard,
        `"${emp.firstName} ${emp.lastName}"`,
        `"${emp.jobTitle}"`,
        `"${emp.department}"`,
        t.q1.toFixed(2),
        t.q2.toFixed(2),
        t.cestaTicket.toFixed(2),
        t.bonoResponsabilidad.toFixed(2),
        t.bonoPuntualidad.toFixed(2),
        t.totalAsignaciones.toFixed(2),
        t.totalDeducciones.toFixed(2),
        t.netoTotal.toFixed(2),
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nomina_Contraloria_Municipal_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-700" />
            Consolidado Salarial y Nómina · Contraloría Municipal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Desglose de Quincenas (Q1 y Q2), Cesta Ticket Socialista, Bonos de Responsabilidad y Puntualidad
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            Exportar Nómina (CSV)
          </button>
        </div>
      </div>

      {/* Institutional KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Q1 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Quincena 1 (Día 15)</span>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            {formatCurrency(aggregate.q1)}
          </div>
          <span className="text-[10px] text-slate-400">Plantilla general</span>
        </div>

        {/* Q2 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Quincena 2 (Fin Mes)</span>
          <div className="text-base font-bold font-mono text-slate-900 mt-1">
            {formatCurrency(aggregate.q2)}
          </div>
          <span className="text-[10px] text-slate-400">Plantilla general</span>
        </div>

        {/* Cesta Ticket */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-emerald-700 uppercase font-bold block">Cesta Ticket</span>
          <div className="text-base font-bold font-mono text-emerald-800 mt-1">
            {formatCurrency(aggregate.cestaTicket)}
          </div>
          <span className="text-[10px] text-emerald-600">Alimentación</span>
        </div>

        {/* Bono Responsabilidad */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-blue-700 uppercase font-bold block">Bono Responsabilidad</span>
          <div className="text-base font-bold font-mono text-blue-900 mt-1">
            {formatCurrency(aggregate.bonoResponsabilidad)}
          </div>
          <span className="text-[10px] text-blue-600">Nivel de mando</span>
        </div>

        {/* Bono Puntualidad */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-purple-700 uppercase font-bold block">Bono Puntualidad</span>
          <div className="text-base font-bold font-mono text-purple-900 mt-1">
            {formatCurrency(aggregate.bonoPuntualidad)}
          </div>
          <span className="text-[10px] text-purple-600">Asistencia regular</span>
        </div>

        {/* Neto Total */}
        <div className="bg-blue-900 text-white p-4 rounded-xl border border-blue-950 shadow-xs">
          <span className="text-[10px] text-blue-200 uppercase font-bold block">Total Neto Mensual</span>
          <div className="text-base font-extrabold font-mono text-white mt-1">
            {formatCurrency(aggregate.totalNeto)}
          </div>
          <span className="text-[10px] text-blue-300">Presupuesto nómina</span>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar funcionario por nombre o cédula..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Mostrando {filteredEmployees.length} de {employees.length} funcionarios
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Funcionario / Cédula</th>
                <th className="py-3 px-4">Cargo / Ubicación</th>
                <th className="py-3 px-4 text-right">Quincena 1</th>
                <th className="py-3 px-4 text-right">Quincena 2</th>
                <th className="py-3 px-4 text-right">Cesta Ticket</th>
                <th className="py-3 px-4 text-right">Bono Resp.</th>
                <th className="py-3 px-4 text-right">Bono Punt.</th>
                <th className="py-3 px-4 text-right">Neto Mensual</th>
                <th className="py-3 px-4 text-center">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmployees.map((emp) => {
                const totals = calculateSalaryTotals(emp.salary);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{emp.idCard}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{emp.jobTitle}</div>
                      <div className="text-[10px] text-slate-500">{emp.department}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {formatCurrency(totals.q1)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium">
                      {formatCurrency(totals.q2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                      {formatCurrency(totals.cestaTicket)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-blue-900">
                      {formatCurrency(totals.bonoResponsabilidad)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-purple-900">
                      {formatCurrency(totals.bonoPuntualidad)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 bg-slate-50/70">
                      {formatCurrency(totals.netoTotal)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedEmpForSlip(emp)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1 mx-auto transition-colors"
                        title="Imprimir Recibo de Pago Oficial"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Recibo
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-3 px-4 uppercase text-slate-800">Totales Presupuestarios:</td>
                <td className="py-3 px-4 text-right font-mono">{formatCurrency(aggregate.q1)}</td>
                <td className="py-3 px-4 text-right font-mono">{formatCurrency(aggregate.q2)}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800">{formatCurrency(aggregate.cestaTicket)}</td>
                <td className="py-3 px-4 text-right font-mono text-blue-900">{formatCurrency(aggregate.bonoResponsabilidad)}</td>
                <td className="py-3 px-4 text-right font-mono text-purple-900">{formatCurrency(aggregate.bonoPuntualidad)}</td>
                <td className="py-3 px-4 text-right font-mono text-blue-950 font-black">{formatCurrency(aggregate.totalNeto)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {selectedEmpForSlip && (
        <PrintPaySlipModal
          employee={selectedEmpForSlip}
          onClose={() => setSelectedEmpForSlip(null)}
        />
      )}
    </div>
  );
};
