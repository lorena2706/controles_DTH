import React, { useState } from 'react';
import { X, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { VacationRecord, Employee } from '../types/employee';
import { calculateExactDuration, getVacationDaysByYears, getVacationRuleDescription } from '../utils/hrCalculations';

interface VacationModalProps {
  employee: Employee;
  onSave: (vacation: VacationRecord) => void;
  onClose: () => void;
}

export const VacationModal: React.FC<VacationModalProps> = ({
  employee,
  onSave,
  onClose,
}) => {
  const serviceDuration = calculateExactDuration(employee.publicAdminEntryDate);
  const entitledDays = getVacationDaysByYears(serviceDuration.years);
  const currentYear = new Date().getFullYear();

  const [period, setPeriod] = useState(`${currentYear - 1} - ${currentYear}`);
  const [correspondingDays, setCorrespondingDays] = useState(entitledDays || 15);
  const [daysTaken, setDaysTaken] = useState(entitledDays || 15);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<VacationRecord['status']>('pendiente');
  const [resolutionNumber, setResolutionNumber] = useState(`VAC-${currentYear}-${Math.floor(100 + Math.random() * 900)}`);
  const [notes, setNotes] = useState('');

  // Calculate return date by adding business days (skipping weekends roughly)
  const calculateReturnDate = (start: string, days: number): string => {
    if (!start) return '';
    const d = new Date(start + 'T00:00:00');
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // skip Sat & Sun
        added++;
      }
    }
    return d.toISOString().split('T')[0];
  };

  const returnDate = calculateReturnDate(startDate, daysTaken);
  const daysRemaining = Math.max(0, correspondingDays - daysTaken);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: VacationRecord = {
      id: `vac-${Date.now()}`,
      period,
      serviceYearsAtPeriod: serviceDuration.years,
      correspondingDays: Number(correspondingDays),
      daysTaken: Number(daysTaken),
      daysRemaining,
      startDate,
      returnDate,
      status,
      resolutionNumber,
      notes,
    };
    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base">Registrar Periodo de Vacaciones</h3>
            <p className="text-xs text-slate-300">
              Funcionario: {employee.firstName} {employee.lastName} ({employee.idCard})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Institutional Scale Reminder */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Escala Institucional Aplicable:</p>
              <p className="text-[11px] text-amber-800">
                {serviceDuration.years} años de servicio en la Adm. Pública · <strong>{getVacationRuleDescription(serviceDuration.years)}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Periodo Vacacional</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="2024 - 2025"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">N° Resolución / Auto</label>
              <input
                type="text"
                value={resolutionNumber}
                onChange={(e) => setResolutionNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Días por Escala</label>
              <input
                type="number"
                min="1"
                max="60"
                value={correspondingDays}
                onChange={(e) => setCorrespondingDays(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Días a Disfrutar</label>
              <input
                type="number"
                min="1"
                max={correspondingDays}
                value={daysTaken}
                onChange={(e) => setDaysTaken(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Días Pendientes</label>
              <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700">
                {daysRemaining} días
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio (Salida)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha de Retorno Estimada</label>
              <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-800">
                {returnDate || 'Calculando...'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estado de la Solicitud</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VacationRecord['status'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="pendiente">Pendiente por Disfrutar</option>
                <option value="en_curso">En Curso / Activa</option>
                <option value="disfrutadas">Disfrutadas / Cumplidas</option>
                <option value="vencidas">Vencidas / Fraccionadas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notas u Observaciones</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles sobre el plan de suplencia, fraccionamiento o acuerdo institucional..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Guardar Vacaciones
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
