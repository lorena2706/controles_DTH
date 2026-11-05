import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, RotateCcw, CheckCircle, Scale, ShieldCheck, AlertCircle } from 'lucide-react';
import { VacationScaleRule } from '../types/employee';
import { DEFAULT_VACATION_SCALE_RULES } from '../utils/hrCalculations';

interface VacationScaleModalProps {
  currentScale: VacationScaleRule[];
  onSaveScale: (updatedScale: VacationScaleRule[]) => void;
  onClose: () => void;
}

export const VacationScaleModal: React.FC<VacationScaleModalProps> = ({
  currentScale,
  onSaveScale,
  onClose,
}) => {
  const [scaleList, setScaleList] = useState<VacationScaleRule[]>(
    currentScale.length > 0 ? currentScale : DEFAULT_VACATION_SCALE_RULES
  );

  // Form for adding / editing a bracket
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [minYears, setMinYears] = useState(1);
  const [maxYears, setMaxYears] = useState(5);
  const [days, setDays] = useState(15);
  const [label, setLabel] = useState('1 a 5 años: 15 días');
  const [legalBasis, setLegalBasis] = useState('Ley del Estatuto de la Función Pública');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const startEdit = (rule: VacationScaleRule) => {
    setEditingRuleId(rule.id);
    setMinYears(rule.minYears);
    setMaxYears(rule.maxYears);
    setDays(rule.days);
    setLabel(rule.label);
    setLegalBasis(rule.legalBasis || '');
    setIsAddingNew(false);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();

    if (minYears < 0 || maxYears < minYears || days < 1) {
      alert('Por favor verifique los rangos de años y la cantidad de días.');
      return;
    }

    const autoLabel = label.trim() || `De ${minYears} a ${maxYears} años: ${days} días`;

    if (editingRuleId) {
      // Edit existing
      setScaleList((prev) =>
        prev.map((r) =>
          r.id === editingRuleId
            ? { ...r, minYears, maxYears, days, label: autoLabel, legalBasis: legalBasis.trim() }
            : r
        )
      );
      setEditingRuleId(null);
    } else {
      // Add new
      const newRule: VacationScaleRule = {
        id: `scale-${Date.now()}`,
        minYears,
        maxYears,
        days,
        label: autoLabel,
        legalBasis: legalBasis.trim() || 'Reglamento Interno de Personal',
      };
      setScaleList((prev) => [...prev, newRule].sort((a, b) => a.minYears - b.minYears));
      setIsAddingNew(false);
    }

    // Reset fields
    setMinYears(1);
    setMaxYears(5);
    setDays(15);
    setLabel('');
    setLegalBasis('');
  };

  const handleDeleteRule = (id: string) => {
    if (scaleList.length <= 1) {
      alert('Debe existir al menos un tramo en la escala de vacaciones.');
      return;
    }
    if (confirm('¿Desea eliminar este tramo de la escala de vacaciones?')) {
      setScaleList((prev) => prev.filter((r) => r.id !== id));
      if (editingRuleId === id) {
        setEditingRuleId(null);
      }
    }
  };

  const handleResetDefaults = () => {
    if (confirm('¿Desea restablecer la escala de vacaciones a los valores oficiales por defecto?')) {
      setScaleList(DEFAULT_VACATION_SCALE_RULES);
      setEditingRuleId(null);
      setIsAddingNew(false);
    }
  };

  const handleApply = () => {
    // Sort before saving
    const sorted = [...scaleList].sort((a, b) => a.minYears - b.minYears);
    onSaveScale(sorted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 border border-slate-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Registrar y Configurar Escala de Vacaciones</h3>
              <p className="text-xs text-slate-300">
                Reglamentación de días hábiles de disfrute vacacional por tramo de antigüedad
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto max-h-[75vh]">
          {/* Explanation Banner */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wide">
                Configuración Institucional de la Escala
              </p>
              <p className="text-[11px] text-blue-800 mt-0.5">
                Los tramos registrados en esta tabla determinan de manera automática los días de vacaciones que le corresponden a cada empleado según su cómputo de antigüedad, y activan las alertas de cumplimiento de año.
              </p>
            </div>
          </div>

          {/* Form for Add or Edit */}
          {(isAddingNew || editingRuleId) && (
            <form onSubmit={handleSaveRule} className="p-4 bg-slate-50 border-2 border-blue-300 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 uppercase">
                  {editingRuleId ? 'Modificar Tramo de Escala' : 'Registrar Nuevo Tramo de Vacaciones'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRuleId(null);
                    setIsAddingNew(false);
                  }}
                  className="text-slate-500 hover:text-slate-800 text-xs"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Desde (Años):</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={minYears}
                    onChange={(e) => setMinYears(parseInt(e.target.value) || 0)}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hasta (Años):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={maxYears}
                    onChange={(e) => setMaxYears(parseInt(e.target.value) || 1)}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Días de Vacaciones:</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Descripción / Etiqueta:</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Ej. De 1 a 5 años: 15 días"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fundamento Normativo / Base Legal:</label>
                <input
                  type="text"
                  value={legalBasis}
                  onChange={(e) => setLegalBasis(e.target.value)}
                  placeholder="Ej. Art. 40 Ley del Estatuto de la Función Pública / Convención Colectiva"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingRuleId ? 'Actualizar Tramo' : 'Guardar Nuevo Tramo'}
                </button>
              </div>
            </form>
          )}

          {/* Table of Scale Rules */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100 p-3 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wide text-xs">
                Tramos Vigentes en la Escala ({scaleList.length})
              </span>
              {!isAddingNew && !editingRuleId && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(true);
                    setMinYears(scaleList.length > 0 ? scaleList[scaleList.length - 1].maxYears + 1 : 1);
                    setMaxYears(scaleList.length > 0 ? scaleList[scaleList.length - 1].maxYears + 5 : 5);
                    setDays(15);
                    setLabel('');
                    setLegalBasis('');
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Agregar Tramo
                </button>
              )}
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Rango de Antigüedad</th>
                  <th className="py-2.5 px-3">Días Hábiles</th>
                  <th className="py-2.5 px-3">Etiqueta Oficial</th>
                  <th className="py-2.5 px-3">Base Legal</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {scaleList.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {rule.minYears} a {rule.maxYears} años
                    </td>
                    <td className="py-2.5 px-3 font-mono font-extrabold text-blue-900 text-sm">
                      {rule.days} días
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {rule.label}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {rule.legalBasis || 'Estatuto de la Función Pública'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(rule)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded"
                          title="Modificar este tramo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Eliminar tramo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer Escala Oficial
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              Guardar y Aplicar Escala
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
