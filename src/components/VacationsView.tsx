import React from 'react';
import { Calendar, AlertTriangle, CheckCircle2, ChevronRight, Award, ShieldAlert, Scale, Settings } from 'lucide-react';
import { Employee, VacationScaleRule } from '../types/employee';
import {
  calculateExactDuration,
  calculateTotalSeniority,
  calculateMunicipalSeniority,
  getVacationDaysByYears,
  checkVacationAlert,
  formatDateES,
  DEFAULT_VACATION_SCALE_RULES
} from '../utils/hrCalculations';

interface VacationsViewProps {
  employees: Employee[];
  scale?: VacationScaleRule[];
  onOpenScaleModal: () => void;
  onSelectEmployee: (emp: Employee) => void;
}

export const VacationsView: React.FC<VacationsViewProps> = ({
  employees,
  scale = DEFAULT_VACATION_SCALE_RULES,
  onOpenScaleModal,
  onSelectEmployee,
}) => {
  // Collect all alerts
  const allAlerts = employees
    .map((emp) => {
      const seniority = calculateTotalSeniority(emp);
      return {
        employee: emp,
        alert: checkVacationAlert(emp, scale),
        seniority,
        municipalDuration: calculateMunicipalSeniority(emp),
      };
    })
    .filter((item) => item.alert !== null);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Control Central de Vacaciones y Alertas de Cumplimiento de Año
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Escala reglamentaria institucional de disfrute vacacional remunerado por antigüedad
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenScaleModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Scale className="w-4 h-4" />
            Registrar / Modificar Escala de Vacaciones
          </button>

          <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-2 rounded-lg border border-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span className="font-semibold text-amber-900">
              {allAlerts.length} {allAlerts.length === 1 ? 'Alerta activa' : 'Alertas activas'}
            </span>
          </div>
        </div>
      </div>

      {/* Institutional Scale Reference */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              Escala de Vacaciones Registrada ({scale.length} Tramos)
            </h3>
            <p className="text-[11px] text-slate-500">
              Personalizable según convención colectiva o estatuto institucional
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenScaleModal}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5" />
            Configurar Tramos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scale.map((rule) => (
            <div
              key={rule.id || rule.label}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 transition-colors"
            >
              <span className="text-[11px] font-bold text-slate-500 block uppercase">
                {rule.minYears} a {rule.maxYears} años
              </span>
              <div className="text-2xl font-black font-mono text-blue-950 mt-1">
                {rule.days} días
              </div>
              <span className="text-[11px] text-slate-600 font-medium mt-1 block">
                {rule.label}
              </span>
              {rule.legalBasis && (
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                  {rule.legalBasis}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts Section */}
      {allAlerts.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Funcionarios con Cumplimiento de Periodo y Alerta de Vacaciones
            </h3>
            <span className="text-[11px] text-amber-800 font-mono font-medium">
              Actualizado a la fecha de hoy
            </span>
          </div>

          <div className="space-y-3">
            {allAlerts.map(({ employee, alert, seniority, municipalDuration }) => (
              <div
                key={employee.id}
                className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-amber-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {employee.firstName} {employee.lastName}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      C.I. {employee.idCard}
                    </span>
                    <span className="text-xs text-blue-900 font-medium">
                      · {employee.jobTitle}
                    </span>
                  </div>

                  <p className="text-xs text-amber-950 font-medium">
                    {alert?.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-mono">
                    <span>Antigüedad Total: <strong>{seniority.formattedTotal}</strong></span>
                    <span>·</span>
                    <span>Contraloría: <strong>{municipalDuration.formatted}</strong></span>
                    <span>·</span>
                    <span className="text-amber-800 font-bold">
                      Corresponden: {alert?.entitledDays} días hábiles
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectEmployee(employee)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                >
                  Abrir Ficha de Vacaciones
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Institutional Employees Vacation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Plantilla General de Personal y Días de Vacaciones Asignados
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {employees.length} funcionarios registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Funcionario / Cédula</th>
                <th className="py-3 px-4">Cargo / Ubicación</th>
                <th className="py-3 px-4">Ingreso Adm. Pública</th>
                <th className="py-3 px-4">Antigüedad Total Reconocida</th>
                <th className="py-3 px-4 text-center">Días por Escala</th>
                <th className="py-3 px-4">Historial de Vacaciones</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {employees.map((emp) => {
                const seniority = calculateTotalSeniority(emp);
                const entitledDays = getVacationDaysByYears(seniority.totalYears, scale);
                const alert = checkVacationAlert(emp, scale);
                const pendingDays = emp.vacations.reduce((acc, v) => acc + (v.status === 'pendiente' ? v.daysRemaining : 0), 0);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{emp.idCard}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{emp.jobTitle}</div>
                      <div className="text-[11px] text-slate-500">{emp.department}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {formatDateES(emp.publicAdminEntryDate)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      <div className="font-bold">{seniority.formattedTotal}</div>
                      {seniority.hasRecognizedPrior && (
                        <div className="text-[10px] text-purple-700 font-medium">
                          Incluye servicios previos acreditados
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-sm px-2.5 py-1 bg-blue-100 text-blue-900 rounded-md">
                        {entitledDays} días
                      </span>
                      {alert && (
                        <div className="text-[10px] font-bold text-amber-700 mt-1 uppercase">
                          ¡Año cumplido!
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      {emp.vacations.length > 0 ? (
                        <div>
                          <span className="font-semibold">{emp.vacations.length} {emp.vacations.length === 1 ? 'periodo' : 'periodos'}</span>
                          {pendingDays > 0 && (
                            <span className="block text-amber-700 font-bold font-mono">
                              {pendingDays} días pendientes
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Sin historial registrado</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectEmployee(emp)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-xs font-semibold text-slate-700 transition-colors"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
