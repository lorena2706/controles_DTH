import React, { useState } from 'react';
import { X, Printer, Building, FileCheck } from 'lucide-react';
import { Employee } from '../types/employee';
import { calculateSalaryTotals, formatCurrency, formatDateES } from '../utils/hrCalculations';

interface PrintPaySlipModalProps {
  employee: Employee;
  onClose: () => void;
}

export const PrintPaySlipModal: React.FC<PrintPaySlipModalProps> = ({
  employee,
  onClose,
}) => {
  const [payPeriod, setPayPeriod] = useState<'q1' | 'q2' | 'mensual'>('q1');
  const totals = calculateSalaryTotals(employee.salary);

  const handlePrint = () => {
    window.print();
  };

  const currentYear = new Date().getFullYear();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const currentMonthName = monthNames[new Date().getMonth()];

  const periodTitle = payPeriod === 'q1' 
    ? `Primera Quincena de ${currentMonthName} ${currentYear} (01 al 15)`
    : payPeriod === 'q2'
    ? `Segunda Quincena de ${currentMonthName} ${currentYear} (16 al 30/31)`
    : `Consolidado Mensual de ${currentMonthName} ${currentYear}`;

  const baseSalary = payPeriod === 'q1' ? totals.q1 : payPeriod === 'q2' ? totals.q2 : totals.totalQuincenas;
  const cestaTicketPeriod = payPeriod === 'q1' ? 0 : payPeriod === 'q2' ? totals.cestaTicket : totals.cestaTicket;
  const bonoResponsabilidadPeriod = payPeriod === 'mensual' ? totals.bonoResponsabilidad : totals.bonoResponsabilidad / 2;
  const bonoPuntualidadPeriod = payPeriod === 'mensual' ? totals.bonoPuntualidad : totals.bonoPuntualidad / 2;
  const primaAntiguedadPeriod = payPeriod === 'mensual' ? totals.primaAntiguedad : totals.primaAntiguedad / 2;
  const primaProfesionalizacionPeriod = payPeriod === 'mensual' ? totals.primaProfesionalizacion : totals.primaProfesionalizacion / 2;
  const primaHijosPeriod = payPeriod === 'mensual' ? totals.primaHijos : totals.primaHijos / 2;
  const otrasAsignacionesPeriod = payPeriod === 'mensual' ? totals.otrasAsignaciones : payPeriod === 'q2' ? totals.otrasAsignaciones : 0;

  const totalAsignacionesCalculadas = baseSalary + cestaTicketPeriod + bonoResponsabilidadPeriod + bonoPuntualidadPeriod + primaAntiguedadPeriod + primaProfesionalizacionPeriod + primaHijosPeriod + otrasAsignacionesPeriod;

  const ivssPeriod = payPeriod === 'mensual' ? totals.deduccionIVSS : totals.deduccionIVSS / 2;
  const rpePeriod = payPeriod === 'mensual' ? totals.deduccionRPE : totals.deduccionRPE / 2;
  const faovPeriod = payPeriod === 'mensual' ? totals.deduccionFAOV : totals.deduccionFAOV / 2;
  const otrasDeduccionesPeriod = payPeriod === 'mensual' ? totals.otrasDeducciones : payPeriod === 'q2' ? totals.otrasDeducciones : 0;

  const totalDeduccionesCalculadas = ivssPeriod + rpePeriod + faovPeriod + otrasDeduccionesPeriod;
  const netoCalculado = Math.max(0, totalAsignacionesCalculadas - totalDeduccionesCalculadas);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 border border-slate-300 overflow-hidden flex flex-col">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Periodo de Pago:
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setPayPeriod('q1')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${payPeriod === 'q1' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                1ra Quincena
              </button>
              <button
                type="button"
                onClick={() => setPayPeriod('q2')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${payPeriod === 'q2' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                2da Quincena
              </button>
              <button
                type="button"
                onClick={() => setPayPeriod('mensual')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${payPeriod === 'mensual' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                Mensual Completo
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Imprimir Recibo
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Slip */}
        <div className="p-8 bg-white print-page text-slate-900 font-sans text-xs">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center relative">
            <div className="text-[11px] font-bold tracking-wider uppercase text-slate-900">
              República Bolivariana de Venezuela
            </div>
            <div className="text-[10px] font-bold text-slate-700 uppercase">
              Contraloría Municipal · Órgano de Control Fiscal
            </div>
            <div className="text-[10px] text-slate-600 uppercase">
              Dirección de Administración y Recursos Humanos
            </div>
            <div className="text-sm font-extrabold text-blue-950 mt-1 uppercase tracking-wide">
              Comprobante Oficial de Pago de Nómina
            </div>
            <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
              {periodTitle}
            </div>
          </div>

          {/* Employee Meta Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 border border-slate-300 rounded-sm mb-4 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Funcionario:</span>
              <strong className="text-slate-900 font-bold">{employee.firstName} {employee.lastName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Cédula de Identidad:</span>
              <span className="font-mono font-bold text-slate-900">{employee.idCard}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Cargo:</span>
              <span className="font-medium text-slate-900">{employee.jobTitle}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Unidad / Dirección:</span>
              <span className="text-slate-800">{employee.department}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Condición Laboral:</span>
              <span className="font-medium">{employee.employmentType} ({employee.status.toUpperCase()})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Fecha Ingreso Contraloría:</span>
              <span className="font-mono">{formatDateES(employee.municipalAuditEntryDate)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Entidad Bancaria:</span>
              <span>{employee.bankName || 'Banco de Venezuela'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Cuenta Nómina:</span>
              <span className="font-mono text-[10px]">{employee.bankAccount || '0102-XXXX-XXXX-XXXXXXXX'}</span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="border border-slate-300 rounded-sm overflow-hidden mb-4">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white border-b border-slate-800">
                  <th className="py-1.5 px-3 text-left font-semibold">Código</th>
                  <th className="py-1.5 px-3 text-left font-semibold">Concepto / Descripción</th>
                  <th className="py-1.5 px-3 text-right font-semibold">Asignaciones</th>
                  <th className="py-1.5 px-3 text-right font-semibold">Deducciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-1.5 px-3 font-mono text-slate-500">0100</td>
                  <td className="py-1.5 px-3 font-medium text-slate-900">
                    {payPeriod === 'q1' ? 'Sueldo Básico (1ra Quincena)' : payPeriod === 'q2' ? 'Sueldo Básico (2da Quincena)' : 'Sueldo Básico Mensual'}
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono font-medium">{formatCurrency(baseSalary)}</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                </tr>

                {cestaTicketPeriod > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 font-mono text-slate-500">0120</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">
                      Cesta Ticket Socialista (Ley de Alimentación de los Trabajadores)
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium">{formatCurrency(cestaTicketPeriod)}</td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                  </tr>
                )}

                {bonoResponsabilidadPeriod > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 font-mono text-slate-500">0130</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">
                      Bono de Responsabilidad en el Cargo / Nivel de Mando
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium">{formatCurrency(bonoResponsabilidadPeriod)}</td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                  </tr>
                )}

                {bonoPuntualidadPeriod > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 font-mono text-slate-500">0140</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">
                      Bono de Puntualidad, Asistencia y Rendimiento
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium">{formatCurrency(bonoPuntualidadPeriod)}</td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                  </tr>
                )}

                {primaAntiguedadPeriod > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 font-mono text-slate-500">0150</td>
                    <td className="py-1.5 px-3 text-slate-800">
                      Prima de Antigüedad en la Administración Pública
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium">{formatCurrency(primaAntiguedadPeriod)}</td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                  </tr>
                )}

                {primaProfesionalizacionPeriod > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 font-mono text-slate-500">0160</td>
                    <td className="py-1.5 px-3 text-slate-800">
                      Prima de Profesionalización / Grado Académico
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium">{formatCurrency(primaProfesionalizacionPeriod)}</td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                  </tr>
                )}

                {primaHijosPeriod > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 font-mono text-slate-500">0170</td>
                    <td className="py-1.5 px-3 text-slate-800">
                      Prima por Carga Familiar ({employee.children.length} {employee.children.length === 1 ? 'hijo' : 'hijos'})
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium">{formatCurrency(primaHijosPeriod)}</td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                  </tr>
                )}

                {otrasAsignacionesPeriod > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 font-mono text-slate-500">0190</td>
                    <td className="py-1.5 px-3 text-slate-800">
                      Compensación Especial / Bono Institucional
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium">{formatCurrency(otrasAsignacionesPeriod)}</td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                  </tr>
                )}

                {/* Deducciones */}
                {ivssPeriod > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 font-mono text-slate-500">5100</td>
                    <td className="py-1.5 px-3 text-slate-800">
                      Retención Seguro Social Obligatorio (IVSS 4%)
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-1.5 px-3 text-right font-mono text-rose-700">{formatCurrency(ivssPeriod)}</td>
                  </tr>
                )}

                {rpePeriod > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 font-mono text-slate-500">5200</td>
                    <td className="py-1.5 px-3 text-slate-800">
                      Régimen Prestacional de Empleo / Paro Forzoso (0.5%)
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-1.5 px-3 text-right font-mono text-rose-700">{formatCurrency(rpePeriod)}</td>
                  </tr>
                )}

                {faovPeriod > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 font-mono text-slate-500">5300</td>
                    <td className="py-1.5 px-3 text-slate-800">
                      Fondo de Ahorro Obligatorio para la Vivienda (FAOV 1%)
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-1.5 px-3 text-right font-mono text-rose-700">{formatCurrency(faovPeriod)}</td>
                  </tr>
                )}

                {otrasDeduccionesPeriod > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 font-mono text-slate-500">5900</td>
                    <td className="py-1.5 px-3 text-slate-800">
                      Otras Deducciones / Aporte Institucional
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-1.5 px-3 text-right font-mono text-rose-700">{formatCurrency(otrasDeduccionesPeriod)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <td colSpan={2} className="py-2 px-3 text-right uppercase text-slate-700">Sub-Totales:</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-900">{formatCurrency(totalAsignacionesCalculadas)}</td>
                  <td className="py-2 px-3 text-right font-mono text-rose-700">{formatCurrency(totalDeduccionesCalculadas)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Net Pay Highlight */}
          <div className="bg-blue-50 border-2 border-blue-900 p-3 rounded-sm flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase text-blue-950 block">Neto Total a Percibir:</span>
              <span className="text-[10px] text-blue-800">Transferencia Electrónica de Fondos en Cuenta Nómina</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-blue-950">
              {formatCurrency(netoCalculado)}
            </div>
          </div>

          {/* Signature Lines */}
          <div className="grid grid-cols-2 gap-12 pt-6 text-center text-[10px]">
            <div>
              <div className="border-t border-slate-500 pt-1.5 mx-6">
                <p className="font-bold text-slate-900 uppercase">Dirección de Recursos Humanos</p>
                <p className="text-slate-600">Elaborado y Verificado · Contraloría Municipal</p>
              </div>
            </div>
            <div>
              <div className="border-t border-slate-500 pt-1.5 mx-6">
                <p className="font-bold text-slate-900 uppercase">{employee.firstName} {employee.lastName}</p>
                <p className="text-slate-600 font-mono">C.I. {employee.idCard} (Firma / Huella)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (No print) */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-2 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Imprimir Comprobante Oficial
          </button>
        </div>
      </div>
    </div>
  );
};
