import React, { useState } from 'react';
import {
  Search,
  Filter,
  User,
  Users,
  Calendar,
  FileText,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  Edit2,
  Trash2,
  HeartPulse,
  Award,
  DollarSign,
  Building
} from 'lucide-react';
import { Employee } from '../types/employee';
import {
  calculateExactDuration,
  calculateTotalSeniority,
  calculateMunicipalSeniority,
  getVacationDaysByYears,
  checkVacationAlert,
  calculateSalaryTotals,
  formatCurrency,
  formatDateES
} from '../utils/hrCalculations';

interface EmployeeListViewProps {
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onOpenNewEmployeeModal: () => void;
}

export const EmployeeListView: React.FC<EmployeeListViewProps> = ({
  employees,
  onSelectEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onOpenNewEmployeeModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Extract unique departments
  const departments = Array.from(new Set(employees.map((e) => e.department))).filter(Boolean);

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.idCard.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'alert_vacaciones' && checkVacationAlert(emp) !== null) ||
      (statusFilter === 'con_hijos' && emp.children.length > 0) ||
      (statusFilter === 'con_conyuge' && !!emp.spouse) ||
      emp.status === statusFilter;

    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Directorio y Expedientes de Personal · Contraloría Municipal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión integral de datos personales, carga familiar, currículum, gaceta, cómputo de servicio y asignaciones salariales
          </p>
        </div>

        <button
          onClick={onOpenNewEmployeeModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          + Agregar Nuevo Trabajador
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({employees.length})
            </button>
            <button
              onClick={() => setStatusFilter('alert_vacaciones')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                statusFilter === 'alert_vacaciones' ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Alertas Vacaciones
            </button>
            <button
              onClick={() => setStatusFilter('con_hijos')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'con_hijos' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Con Hijos
            </button>
            <button
              onClick={() => setStatusFilter('reposo')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'reposo' ? 'bg-rose-100 text-rose-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En Reposo
            </button>
          </div>

          {/* Department filter */}
          {departments.length > 0 && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las Direcciones</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Live Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cédula, nombre, cargo..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Main Employee Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredEmployees.map((emp) => {
          const publicAdminDur = calculateExactDuration(emp.publicAdminEntryDate);
          const municipalDur = calculateMunicipalSeniority(emp);
          const seniority = calculateTotalSeniority(emp);
          const vacationDays = getVacationDaysByYears(seniority.totalYears);
          const alert = checkVacationAlert(emp);
          const salaryTotals = calculateSalaryTotals(emp.salary);

          return (
            <div
              key={emp.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Top ribbon with Cédula and Status */}
                <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-900">{emp.idCard}</span>
                  <div className="flex items-center gap-1.5">
                    {seniority.isDiscontinuous && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-mono">
                        Discontinuo
                      </span>
                    )}
                    {emp.status === 'activo' && (
                      <span className="text-[11px] font-semibold text-emerald-700">Activo</span>
                    )}
                    {emp.status === 'reposo' && (
                      <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5" />
                        Reposo
                      </span>
                    )}
                    {emp.status === 'vacaciones' && (
                      <span className="text-[11px] font-semibold text-blue-700">Vacaciones</span>
                    )}
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 text-[11px]">{emp.employmentType}</span>
                  </div>
                </div>

                {/* Main Body */}
                <div className="p-5 space-y-4">
                  {/* Photo & Name */}
                  <div className="flex items-center gap-3.5">
                    {emp.photoUrl ? (
                      <img
                        src={emp.photoUrl}
                        alt={`${emp.firstName} ${emp.lastName}`}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-lg">
                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <p className="text-xs text-blue-900 font-medium">{emp.jobTitle}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{emp.department}</p>
                    </div>
                  </div>

                  {/* Dual Service Time Counters */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">
                          Antigüedad Total (Adm. Pública):
                        </span>
                        {seniority.isDiscontinuous && (
                          <span className="text-[9px] text-amber-700 font-bold uppercase font-mono">
                            Manual
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-bold text-slate-900">
                        {seniority.formattedTotal}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {seniority.isDiscontinuous
                          ? 'Cómputo certificado en expediente'
                          : `Ingreso: ${formatDateES(emp.publicAdminEntryDate)}${seniority.hasRecognizedPrior ? ' · (+Servicios previos)' : ''}`}
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">
                        Tiempo en Contraloría Municipal:
                      </span>
                      <div className="font-mono font-semibold text-slate-800">
                        {municipalDur.formatted}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Ingreso: {formatDateES(emp.municipalAuditEntryDate)}
                      </div>
                    </div>
                  </div>

                  {/* Vacation Alert Banner if present */}
                  {alert && (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[11px]">¡Alerta de Vacaciones!</span>
                        <p className="text-[10px] text-amber-800 leading-tight">
                          Corresponden <strong>{vacationDays} días hábiles</strong> según escala de {publicAdminDur.years} años.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Carga Familiar & Documents quick badges */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Carga Familiar:</span>
                      <div className="font-medium text-slate-800">
                        {emp.spouse ? 'Cónyuge registrado' : 'Sin cónyuge'}
                      </div>
                      <div className="text-slate-500 font-mono">
                        {emp.children.length} {emp.children.length === 1 ? 'hijo' : 'hijos'}
                      </div>
                    </div>

                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Documentos:</span>
                      <div className="text-slate-800">
                        CV: {emp.curriculumDoc ? <strong className="text-emerald-700">Cargado</strong> : <span className="text-amber-700">Falta</span>}
                      </div>
                      <div className="text-slate-800">
                        Gaceta: {emp.gacetaDoc ? <strong className="text-emerald-700">Sí</strong> : <span className="text-rose-700">No</span>}
                      </div>
                    </div>
                  </div>

                  {/* Salary Preview */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Sueldo Neto Mensual:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(salaryTotals.netoTotal)}
                      </span>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-mono">
                      Q1: {formatCurrency(salaryTotals.q1)}<br />
                      Q2: {formatCurrency(salaryTotals.q2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectEmployee(emp)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                >
                  Abrir Ficha Individual
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditEmployee(emp)}
                    title="Editar datos del funcionario"
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteEmployee(emp.id)}
                    title="Eliminar funcionario"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <User className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No se encontraron funcionarios</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No existen registros que coincidan con la búsqueda o el filtro seleccionado.
          </p>
          <button
            onClick={onOpenNewEmployeeModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            Registrar Nuevo Funcionario
          </button>
        </div>
      )}
    </div>
  );
};
