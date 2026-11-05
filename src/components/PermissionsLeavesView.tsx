import React, { useState } from 'react';
import { Clock, HeartPulse, Search, Filter, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Employee, PermissionRecord, MedicalLeaveRecord } from '../types/employee';
import { formatDateES } from '../utils/hrCalculations';

interface PermissionsLeavesViewProps {
  employees: Employee[];
  onSelectEmployee: (emp: Employee) => void;
}

export const PermissionsLeavesView: React.FC<PermissionsLeavesViewProps> = ({
  employees,
  onSelectEmployee,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'permisos' | 'reposos'>('permisos');
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all permissions with employee details
  const allPermissions = employees.flatMap((emp) =>
    emp.permissions.map((perm) => ({
      ...perm,
      employee: emp,
    }))
  );

  // Collect all medical leaves with employee details
  const allMedicalLeaves = employees.flatMap((emp) =>
    emp.medicalLeaves.map((leave) => ({
      ...leave,
      employee: emp,
    }))
  );

  const activeLeavesCount = allMedicalLeaves.filter((l) => l.status === 'activo').length;
  const activePermissionsCount = allPermissions.filter((p) => p.status === 'aprobado').length;

  // Filtered lists
  const filteredPermissions = allPermissions.filter(
    (p) =>
      p.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employee.idCard.includes(searchTerm) ||
      p.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeaves = allMedicalLeaves.filter(
    (l) =>
      l.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.employee.idCard.includes(searchTerm) ||
      l.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.ivssValidationCode && l.ivssValidationCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Control Central de Permisos Solicitados y Reposos Médicos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro, convalidaciones IVSS y ausencias justificadas de la Contraloría Municipal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-900 font-semibold">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{allPermissions.length} Permisos Solicitados</span>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-900 font-semibold">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <span>{activeLeavesCount} Reposos Activos Hoy</span>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSubTab('permisos')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'permisos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            Permisos Solicitados ({allPermissions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('reposos')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'reposos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-rose-600" />
            Reposos Médicos ({allMedicalLeaves.length})
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cédula, nombre, diagnóstico..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Table: Permisos Solicitados */}
      {activeSubTab === 'permisos' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Funcionario / Cédula</th>
                  <th className="py-3 px-4">Tipo de Permiso</th>
                  <th className="py-3 px-4">Motivo / Justificación</th>
                  <th className="py-3 px-4">Periodo (Desde / Hasta)</th>
                  <th className="py-3 px-4 text-center">Días Hábiles</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPermissions.length > 0 ? (
                  filteredPermissions.map((perm) => (
                    <tr key={perm.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{perm.employee.firstName} {perm.employee.lastName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{perm.employee.idCard} · {perm.employee.jobTitle}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 capitalize">
                          {perm.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-700">
                        <p className="line-clamp-2">{perm.reason}</p>
                        {perm.approvedBy && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">Autorizado por: {perm.approvedBy}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <div>{formatDateES(perm.startDate)}</div>
                        <div className="text-[10px] text-slate-400">al {formatDateES(perm.endDate)}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-blue-900">
                        {perm.workingDays}d
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          perm.status === 'aprobado' ? 'bg-emerald-100 text-emerald-800' :
                          perm.status === 'pendiente' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {perm.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectEmployee(perm.employee)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-xs font-semibold text-slate-700 transition-colors"
                        >
                          Ver Ficha
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No se encontraron permisos registrados con el criterio de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table: Reposos Médicos */}
      {activeSubTab === 'reposos' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-rose-900/90 text-white font-semibold border-b border-rose-950">
                <tr>
                  <th className="py-3 px-4">Funcionario / Cédula</th>
                  <th className="py-3 px-4">Diagnóstico / Centro de Salud</th>
                  <th className="py-3 px-4">Médico Tratante / Boleta IVSS</th>
                  <th className="py-3 px-4">Fecha Inicio / Fin</th>
                  <th className="py-3 px-4 text-center">Total Días</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{leave.employee.firstName} {leave.employee.lastName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{leave.employee.idCard} · {leave.employee.department}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-rose-950">{leave.diagnosis}</div>
                        <div className="text-[11px] text-slate-500">{leave.healthCenter}</div>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-700">
                        <div>{leave.doctorName}</div>
                        {leave.ivssValidationCode && (
                          <div className="font-mono font-bold text-rose-800 text-[10px] mt-0.5">
                            {leave.ivssValidationCode}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <div>{formatDateES(leave.startDate)}</div>
                        <div className="text-[10px] text-slate-400">al {formatDateES(leave.endDate)}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-rose-800">
                        {leave.totalDays} días
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          leave.status === 'activo' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {leave.status === 'activo' ? 'Activo Hoy' : leave.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectEmployee(leave.employee)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-rose-600 hover:text-white rounded text-xs font-semibold text-slate-700 transition-colors"
                        >
                          Ver Ficha
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No se encontraron reposos médicos registrados con el criterio de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
