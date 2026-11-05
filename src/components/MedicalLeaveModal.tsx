import React, { useState } from 'react';
import { X, HeartPulse, CheckCircle, Upload } from 'lucide-react';
import { MedicalLeaveRecord, MedicalLeaveType, Employee } from '../types/employee';

interface MedicalLeaveModalProps {
  employee: Employee;
  onSave: (leave: MedicalLeaveRecord) => void;
  onClose: () => void;
}

export const MedicalLeaveModal: React.FC<MedicalLeaveModalProps> = ({
  employee,
  onSave,
  onClose,
}) => {
  const [type, setType] = useState<MedicalLeaveType>('ivss');
  const [diagnosis, setDiagnosis] = useState('');
  const [healthCenter, setHealthCenter] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorLicense, setDoctorLicense] = useState('');
  const [ivssValidationCode, setIvssValidationCode] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalDays, setTotalDays] = useState(3);
  const [status, setStatus] = useState<MedicalLeaveRecord['status']>('activo');
  const [notes, setNotes] = useState('');

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    const diff = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    const days = calculateDays(val, endDate);
    setTotalDays(days);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    const days = calculateDays(startDate, val);
    setTotalDays(days);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: MedicalLeaveRecord = {
      id: `med-${Date.now()}`,
      type,
      diagnosis,
      healthCenter,
      doctorName,
      doctorLicense,
      ivssValidationCode,
      startDate,
      endDate,
      totalDays: Number(totalDays) || 1,
      status,
      notes,
    };
    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-700 rounded-lg">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Registrar Reposo Médico</h3>
              <p className="text-xs text-rose-200">
                Funcionario: {employee.firstName} {employee.lastName} ({employee.idCard})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-rose-200 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origen / Tipo de Reposo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MedicalLeaveType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="ivss">Reposo Convalidado IVSS</option>
                <option value="clinica_hospital">Consulta Hospitalaria / Clínica</option>
                <option value="maternidad_paternidad">Maternidad / Paternidad</option>
                <option value="accidente_laboral">Accidente Laboral</option>
                <option value="aislamiento">Aislamiento Preventivo</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Boleta o Convalidación IVSS</label>
              <input
                type="text"
                value={ivssValidationCode}
                onChange={(e) => setIvssValidationCode(e.target.value)}
                placeholder="Ej. BOLETA-IVSS-4920"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Diagnóstico Médico</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Ej. Cervicobraquialgia aguda con indicación de reposo absoluto..."
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Centro Asistencial</label>
              <input
                type="text"
                value={healthCenter}
                onChange={(e) => setHealthCenter(e.target.value)}
                placeholder="Hospital Central / Policlínica..."
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Médico Tratante y MPPS</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. Nombre Apellido (MPPS-12345)"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Días de Reposo</label>
              <input
                type="number"
                min="1"
                value={totalDays}
                onChange={(e) => setTotalDays(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-rose-700 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estado del Reposo</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MedicalLeaveRecord['status'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="activo">Activo (En curso actualmente)</option>
                <option value="convalidado_ivss">Convalidado por el IVSS</option>
                <option value="pendiente_validacion">Pendiente por Validación</option>
                <option value="finalizado">Finalizado / Culminado</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Observaciones</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalle de entrega en RRHH..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
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
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Guardar Reposo Médico
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
