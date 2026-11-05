import React, { useState } from 'react';
import { X, Calendar, CheckCircle, Clock } from 'lucide-react';
import { PermissionRecord, PermissionType, Employee } from '../types/employee';

interface PermissionModalProps {
  employee: Employee;
  onSave: (permission: PermissionRecord) => void;
  onClose: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  employee,
  onSave,
  onClose,
}) => {
  const [type, setType] = useState<PermissionType>('remunerado');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [workingDays, setWorkingDays] = useState(1);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<PermissionRecord['status']>('aprobado');
  const [approvedBy, setApprovedBy] = useState('Director de Recursos Humanos');
  const [notes, setNotes] = useState('');

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (new Date(val) > new Date(endDate)) {
      setEndDate(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: PermissionRecord = {
      id: `perm-${Date.now()}`,
      type,
      startDate,
      endDate,
      workingDays: Number(workingDays) || 1,
      reason,
      status,
      approvedBy,
      requestDate: new Date().toISOString().split('T')[0],
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
            <h3 className="font-semibold text-base">Registrar Solicitud de Permiso</h3>
            <p className="text-xs text-slate-300">
              Funcionario: {employee.firstName} {employee.lastName} ({employee.idCard})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Permiso</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PermissionType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="remunerado">Permiso Remunerado</option>
                <option value="no_remunerado">Permiso No Remunerado</option>
                <option value="diligencia_personal">Diligencia Personal Justificada</option>
                <option value="duelo_familiar">Duelo Familiar (Consanguinidad)</option>
                <option value="matrimonio">Nupcias / Matrimonio</option>
                <option value="estudio_capacitacion">Estudio / Capacitación Académica</option>
                <option value="comision_servicio">Comisión de Servicio Oficial</option>
                <option value="cumpleanos">Día de Cumpleaños Institucional</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Días Hábiles Solicitados</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={workingDays}
                onChange={(e) => setWorkingDays(parseFloat(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Motivo / Justificación</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explique el motivo de la solicitud de permiso según la Ley del Estatuto de la Función Pública..."
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estado de la Solicitud</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PermissionRecord['status'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="aprobado">Aprobado</option>
                <option value="pendiente">En Revisión / Pendiente</option>
                <option value="rechazado">Rechazado / Negado</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Autorizado / Revisado Por</label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
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
              Guardar Permiso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
