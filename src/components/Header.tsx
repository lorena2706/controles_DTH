import React from 'react';
import {
  Building2,
  Users,
  Calendar,
  Clock,
  DollarSign,
  UserPlus,
  Download,
  Upload,
  AlertTriangle,
  HeartPulse,
  Scale
} from 'lucide-react';
import { Employee } from '../types/employee';

interface HeaderProps {
  currentView: 'empleados' | 'vacaciones' | 'permisos' | 'nomina';
  onNavigate: (view: 'empleados' | 'vacaciones' | 'permisos' | 'nomina') => void;
  onOpenNewEmployeeModal: () => void;
  onOpenVacationScaleModal?: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  employees: Employee[];
  activeAlertsCount: number;
  activeLeavesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenNewEmployeeModal,
  onOpenVacationScaleModal,
  onExportData,
  onImportData,
  employees,
  activeAlertsCount,
  activeLeavesCount,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top institutional sub-bar */}
      <div className="bg-slate-950 px-4 sm:px-8 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">REPÚBLICA BOLIVARIANA DE VENEZUELA</span>
          <span>·</span>
          <span>CONTRALORÍA MUNICIPAL</span>
          <span>·</span>
          <span>DIRECCIÓN DE RECURSOS HUMANOS</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>Plantilla Activa: <strong className="text-white font-mono">{employees.length}</strong></span>
          <span>·</span>
          <span className="text-amber-400">Alertas de Vacaciones: <strong className="font-mono">{activeAlertsCount}</strong></span>
        </div>
      </div>

      {/* Main Bar: 3-Zone Contract */}
      <div className="px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black tracking-tight text-white whitespace-nowrap">
              SIGERH · Contraloría Municipal
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5">
              Control Integral de Personal y Expedientes
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => onNavigate('empleados')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              currentView === 'empleados'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Expedientes y Personal
          </button>

          <button
            onClick={() => onNavigate('vacaciones')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 relative ${
              currentView === 'vacaciones'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Vacaciones & Escala
            {activeAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-mono font-bold text-[10px] rounded-full">
                {activeAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('permisos')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              currentView === 'permisos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            Permisos & Reposos
            {activeLeavesCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-600 text-white font-mono font-bold text-[10px] rounded-full">
                {activeLeavesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('nomina')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              currentView === 'nomina'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Salarios & Nómina
          </button>
        </nav>

        {/* Zone 3: Primary Action + Database Backup */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportData}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={onExportData}
            title="Exportar respaldo de datos en formato JSON"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition-colors hidden sm:flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            <span className="hidden xl:inline">Respaldar</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Cargar copia de seguridad previa"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition-colors hidden sm:flex items-center gap-1"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden xl:inline">Restaurar</span>
          </button>

          {onOpenVacationScaleModal && (
            <button
              type="button"
              onClick={onOpenVacationScaleModal}
              title="Registrar y configurar la escala de vacaciones"
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 whitespace-nowrap shrink-0"
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Escala Vacaciones</span>
            </button>
          )}

          <button
            onClick={onOpenNewEmployeeModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            + Registrar Funcionario
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden flex items-center justify-around px-2 py-2 bg-slate-950 border-t border-slate-800 text-[11px] font-semibold">
        <button
          onClick={() => onNavigate('empleados')}
          className={`py-1 px-2 rounded ${currentView === 'empleados' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          Empleados
        </button>
        <button
          onClick={() => onNavigate('vacaciones')}
          className={`py-1 px-2 rounded ${currentView === 'vacaciones' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          Vacaciones {activeAlertsCount > 0 && `(${activeAlertsCount})`}
        </button>
        <button
          onClick={() => onNavigate('permisos')}
          className={`py-1 px-2 rounded ${currentView === 'permisos' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          Permisos & Reposos
        </button>
        <button
          onClick={() => onNavigate('nomina')}
          className={`py-1 px-2 rounded ${currentView === 'nomina' ? 'text-blue-400' : 'text-slate-400'}`}
        >
          Nómina
        </button>
      </div>
    </header>
  );
};
