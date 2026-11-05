import React, { useState } from 'react';
import { X, Calendar, Clock, Building, ShieldCheck, CheckCircle, AlertCircle, FileText, History } from 'lucide-react';
import { Employee, VacationScaleRule } from '../types/employee';
import {
  calculateExactDuration,
  calculateTotalSeniority,
  calculateMunicipalSeniority,
  getVacationDaysByYears,
  getVacationRuleDescription,
  DEFAULT_VACATION_SCALE_RULES
} from '../utils/hrCalculations';

interface SeniorityModalProps {
  employee: Employee;
  scale?: VacationScaleRule[];
  onSave: (updatedEmployee: Employee) => void;
  onClose: () => void;
}

export const SeniorityModal: React.FC<SeniorityModalProps> = ({
  employee,
  scale = DEFAULT_VACATION_SCALE_RULES,
  onSave,
  onClose,
}) => {
  // Mode: continuous calculation vs discontinuous/non-continuous manual computation
  const initialIsDiscontinuous = employee.seniorityType === 'discontinuo' || !!employee.isManualSeniority;
  const [seniorityMode, setSeniorityMode] = useState<'continuo' | 'discontinuo'>(
    initialIsDiscontinuous ? 'discontinuo' : 'continuo'
  );

  // Continuous dates
  const [publicAdminEntryDate, setPublicAdminEntryDate] = useState(
    employee.publicAdminEntryDate || new Date().toISOString().split('T')[0]
  );
  const [municipalAuditEntryDate, setMunicipalAuditEntryDate] = useState(
    employee.municipalAuditEntryDate || new Date().toISOString().split('T')[0]
  );

  // Discontinuous / Manual computation fields
  const [manualPublicAdminYears, setManualPublicAdminYears] = useState<number>(
    employee.manualPublicAdminYears ?? (employee.customSeniorityYears || 0)
  );
  const [manualPublicAdminMonths, setManualPublicAdminMonths] = useState<number>(
    employee.manualPublicAdminMonths ?? 0
  );
  const [manualPublicAdminDays, setManualPublicAdminDays] = useState<number>(
    employee.manualPublicAdminDays ?? 0
  );

  const [manualMunicipalAuditYears, setManualMunicipalAuditYears] = useState<number>(
    employee.manualMunicipalAuditYears ?? 0
  );
  const [manualMunicipalAuditMonths, setManualMunicipalAuditMonths] = useState<number>(
    employee.manualMunicipalAuditMonths ?? 0
  );
  const [manualMunicipalAuditDays, setManualMunicipalAuditDays] = useState<number>(
    employee.manualMunicipalAuditDays ?? 0
  );

  const [discontinuousServiceNotes, setDiscontinuousServiceNotes] = useState(
    employee.discontinuousServiceNotes || ''
  );

  // Recognized prior service for continuous mode
  const [hasPriorService, setHasPriorService] = useState(
    !!(employee.recognizedPriorYears || employee.recognizedPriorMonths || employee.recognizedPriorDays)
  );
  const [recognizedPriorYears, setRecognizedPriorYears] = useState(employee.recognizedPriorYears || 0);
  const [recognizedPriorMonths, setRecognizedPriorMonths] = useState(employee.recognizedPriorMonths || 0);
  const [recognizedPriorDays, setRecognizedPriorDays] = useState(employee.recognizedPriorDays || 0);
  const [recognizedServiceResolution, setRecognizedServiceResolution] = useState(
    employee.recognizedServiceResolution || ''
  );
  const [recognizedServiceEntity, setRecognizedServiceEntity] = useState(
    employee.recognizedServiceEntity || ''
  );
  const [recognizedServiceDate, setRecognizedServiceDate] = useState(
    employee.recognizedServiceDate || ''
  );

  // Simulated temporary employee object for real-time live preview
  const isDiscontinuous = seniorityMode === 'discontinuo';
  const previewEmp: Employee = {
    ...employee,
    seniorityType: seniorityMode,
    isManualSeniority: isDiscontinuous,
    publicAdminEntryDate,
    municipalAuditEntryDate,
    manualPublicAdminYears: isDiscontinuous ? Number(manualPublicAdminYears) || 0 : undefined,
    manualPublicAdminMonths: isDiscontinuous ? Number(manualPublicAdminMonths) || 0 : undefined,
    manualPublicAdminDays: isDiscontinuous ? Number(manualPublicAdminDays) || 0 : undefined,
    manualMunicipalAuditYears: isDiscontinuous ? Number(manualMunicipalAuditYears) || 0 : undefined,
    manualMunicipalAuditMonths: isDiscontinuous ? Number(manualMunicipalAuditMonths) || 0 : undefined,
    manualMunicipalAuditDays: isDiscontinuous ? Number(manualMunicipalAuditDays) || 0 : undefined,
    discontinuousServiceNotes: isDiscontinuous ? discontinuousServiceNotes : undefined,
    recognizedPriorYears: !isDiscontinuous && hasPriorService ? Number(recognizedPriorYears) || 0 : undefined,
    recognizedPriorMonths: !isDiscontinuous && hasPriorService ? Number(recognizedPriorMonths) || 0 : undefined,
    recognizedPriorDays: !isDiscontinuous && hasPriorService ? Number(recognizedPriorDays) || 0 : undefined,
    recognizedServiceResolution,
    recognizedServiceEntity,
    recognizedServiceDate,
    customSeniorityYears: undefined,
  };

  const previewSeniority = calculateTotalSeniority(previewEmp);
  const previewMunicipalDuration = isDiscontinuous 
    ? calculateMunicipalSeniority(previewEmp)
    : calculateExactDuration(municipalAuditEntryDate);
  const entitledDays = getVacationDaysByYears(previewSeniority.totalYears, scale);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Employee = {
      ...employee,
      seniorityType: seniorityMode,
      isManualSeniority: isDiscontinuous,
      publicAdminEntryDate,
      municipalAuditEntryDate,
      manualPublicAdminYears: isDiscontinuous ? Number(manualPublicAdminYears) || 0 : undefined,
      manualPublicAdminMonths: isDiscontinuous ? Number(manualPublicAdminMonths) || 0 : undefined,
      manualPublicAdminDays: isDiscontinuous ? Number(manualPublicAdminDays) || 0 : undefined,
      manualMunicipalAuditYears: isDiscontinuous ? Number(manualMunicipalAuditYears) || 0 : undefined,
      manualMunicipalAuditMonths: isDiscontinuous ? Number(manualMunicipalAuditMonths) || 0 : undefined,
      manualMunicipalAuditDays: isDiscontinuous ? Number(manualMunicipalAuditDays) || 0 : undefined,
      discontinuousServiceNotes: isDiscontinuous ? discontinuousServiceNotes.trim() : undefined,
      recognizedPriorYears: !isDiscontinuous && hasPriorService ? Number(recognizedPriorYears) || 0 : undefined,
      recognizedPriorMonths: !isDiscontinuous && hasPriorService ? Number(recognizedPriorMonths) || 0 : undefined,
      recognizedPriorDays: !isDiscontinuous && hasPriorService ? Number(recognizedPriorDays) || 0 : undefined,
      recognizedServiceResolution: recognizedServiceResolution.trim() || undefined,
      recognizedServiceEntity: recognizedServiceEntity.trim() || undefined,
      recognizedServiceDate: recognizedServiceDate || undefined,
      customSeniorityYears: undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 border border-slate-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Registrar y Ajustar Cómputo de Antigüedad</h3>
              <p className="text-xs text-slate-300">
                Funcionario: {employee.firstName} {employee.lastName} ({employee.idCard})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Segmented Tabs */}
        <div className="p-3 bg-slate-100 border-b border-slate-200">
          <div className="flex rounded-lg bg-slate-200/80 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSeniorityMode('continuo')}
              className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center gap-2 ${
                seniorityMode === 'continuo'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span>1. Servicios Continuos (Por Fecha)</span>
            </button>
            <button
              type="button"
              onClick={() => setSeniorityMode('discontinuo')}
              className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center gap-2 ${
                seniorityMode === 'discontinuo'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>2. Servicios No Continuos / Discontinuos (Manual)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto max-h-[75vh]">
          {/* Live Preview Box */}
          <div className={`p-4 rounded-xl border-2 space-y-2 ${
            isDiscontinuous
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold text-xs uppercase flex items-center gap-1.5 ${
                isDiscontinuous ? 'text-amber-950' : 'text-blue-950'
              }`}>
                <ShieldCheck className={`w-4 h-4 ${isDiscontinuous ? 'text-amber-600' : 'text-blue-700'}`} />
                Cómputo en Tiempo Real ({isDiscontinuous ? 'Servicios No Continuos' : 'Servicios Continuos'})
              </span>
              <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded ${
                isDiscontinuous ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {entitledDays} Días de Vacaciones
              </span>
            </div>

            <div className={`text-xl font-extrabold font-mono ${
              isDiscontinuous ? 'text-amber-950' : 'text-blue-950'
            }`}>
              {previewSeniority.formattedTotal}
            </div>

            <div className={`grid grid-cols-2 gap-2 text-[11px] pt-1 border-t font-mono ${
              isDiscontinuous ? 'text-amber-900 border-amber-200' : 'text-blue-900 border-blue-200'
            }`}>
              <div>
                Permanencia en Contraloría: <strong>{previewMunicipalDuration.formatted}</strong>
              </div>
              <div className="text-right">
                Escala Aplicable: <strong>{getVacationRuleDescription(previewSeniority.totalYears, scale)}</strong>
              </div>
            </div>
          </div>

          {/* Mode 1: Continuous Services */}
          {seniorityMode === 'continuo' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-xs border-b border-slate-200 pb-1">
                  Fechas Clave de Ingreso Continuo
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Fecha Ingreso a la Administración Pública (*)
                    </label>
                    <input
                      type="date"
                      value={publicAdminEntryDate}
                      onChange={(e) => setPublicAdminEntryDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Fecha de inicio ininterrumpida en el sector público.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Fecha Ingreso a la Contraloría Municipal (*)
                    </label>
                    <input
                      type="date"
                      value={municipalAuditEntryDate}
                      onChange={(e) => setMunicipalAuditEntryDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Fecha de toma de posesión en la Contraloría Municipal.
                    </span>
                  </div>
                </div>
              </div>

              {/* Servicios Previos Reconocidos en Modo Continuo */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasPriorServiceCheck"
                      checked={hasPriorService}
                      onChange={(e) => setHasPriorService(e.target.checked)}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <label htmlFor="hasPriorServiceCheck" className="font-bold text-slate-900 uppercase text-xs">
                      ¿Acreditar Servicios Previos Certificados de Otros Entes?
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-500">Resolución de Reconocimiento</span>
                </div>

                {hasPriorService && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Años Previos:</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={recognizedPriorYears}
                          onChange={(e) => setRecognizedPriorYears(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Meses Previos:</label>
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={recognizedPriorMonths}
                          onChange={(e) => setRecognizedPriorMonths(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Días Previos:</label>
                        <input
                          type="number"
                          min="0"
                          max="29"
                          value={recognizedPriorDays}
                          onChange={(e) => setRecognizedPriorDays(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Ente Público de Origen:</label>
                        <input
                          type="text"
                          value={recognizedServiceEntity}
                          onChange={(e) => setRecognizedServiceEntity(e.target.value)}
                          placeholder="Ej. Ministerio de Finanzas / Alcaldía"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">N° de Resolución / Expediente:</label>
                        <input
                          type="text"
                          value={recognizedServiceResolution}
                          onChange={(e) => setRecognizedServiceResolution(e.target.value)}
                          placeholder="Ej. Resolución CM-RRHH-028-2024"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Fecha de la Resolución:</label>
                      <input
                        type="date"
                        value={recognizedServiceDate}
                        onChange={(e) => setRecognizedServiceDate(e.target.value)}
                        className="w-full sm:w-1/2 px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Discontinuous / Non-continuous Services (Manual Entry) */}
          {seniorityMode === 'discontinuo' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <History className="w-4 h-4 text-amber-700" />
                  Registro de Servicios No Continuos o Interrumpidos
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Para funcionarios que han tenido lapsos intermitentes en la administración pública (pasantías por diferentes ministerios, alcaldías o gobernaciones con pausas). Indique el total acumulado certificado según su expediente.
                </p>
              </div>

              {/* Manual Public Admin Seniority */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-xs flex items-center justify-between">
                  <span>1. Tiempo Total Efectivo en Administración Pública</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono font-semibold">
                    Cómputo Discontinuo
                  </span>
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Años Acumulados (*):</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={manualPublicAdminYears}
                      onChange={(e) => setManualPublicAdminYears(parseInt(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Meses Acumulados:</label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={manualPublicAdminMonths}
                      onChange={(e) => setManualPublicAdminMonths(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Días Acumulados:</label>
                    <input
                      type="number"
                      min="0"
                      max="29"
                      value={manualPublicAdminDays}
                      onChange={(e) => setManualPublicAdminDays(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Manual Municipal Comptroller Seniority */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-xs flex items-center justify-between">
                  <span>2. Tiempo Efectivo en la Contraloría Municipal</span>
                  <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono font-semibold">
                    Permanencia Institucional
                  </span>
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Años en Contraloría:</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={manualMunicipalAuditYears}
                      onChange={(e) => setManualMunicipalAuditYears(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Meses en Contraloría:</label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={manualMunicipalAuditMonths}
                      onChange={(e) => setManualMunicipalAuditMonths(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Días en Contraloría:</label>
                    <input
                      type="number"
                      min="0"
                      max="29"
                      value={manualMunicipalAuditDays}
                      onChange={(e) => setManualMunicipalAuditDays(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Detail Notes of Discontinuous Periods */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detalle / Desglose de los Periodos No Continuos (*):
                </label>
                <textarea
                  rows={3}
                  value={discontinuousServiceNotes}
                  onChange={(e) => setDiscontinuousServiceNotes(e.target.value)}
                  placeholder="Ej: Periodo 2012-2015 en Ministerio de Salud (3 años); Periodo 2018-2021 en Alcaldía Municipal (3 años y 4 meses); Ingreso actual Contraloría desde 2023."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Esta relación se reflejará en el expediente y certificaciones de servicio del funcionario.
                </span>
              </div>

              {/* Resolution or Certificate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N° Resolución / Auto que Acredita:</label>
                  <input
                    type="text"
                    value={recognizedServiceResolution}
                    onChange={(e) => setRecognizedServiceResolution(e.target.value)}
                    placeholder="Ej. Auto de Cómputo N° RRHH-045-2024"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Validación en Expediente:</label>
                  <input
                    type="date"
                    value={recognizedServiceDate}
                    onChange={(e) => setRecognizedServiceDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
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
              className={`px-5 py-2 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors ${
                isDiscontinuous ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Guardar Cómputo de Antigüedad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
