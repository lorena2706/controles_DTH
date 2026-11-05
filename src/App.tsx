/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SIGERH - Sistema Integral de Gestión de Recursos Humanos
 * Contraloría Municipal / Administración Pública
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EmployeeListView } from './components/EmployeeListView';
import { EmployeeProfilePage } from './components/EmployeeProfilePage';
import { VacationsView } from './components/VacationsView';
import { PermissionsLeavesView } from './components/PermissionsLeavesView';
import { PayrollView } from './components/PayrollView';
import { EmployeeModal } from './components/EmployeeModal';
import { VacationScaleModal } from './components/VacationScaleModal';
import { Employee, VacationScaleRule } from './types/employee';
import { INITIAL_EMPLOYEES } from './data/initialEmployees';
import { checkVacationAlert, DEFAULT_VACATION_SCALE_RULES } from './utils/hrCalculations';

const STORAGE_KEY = 'sigerh_contraloria_employees_v1';
const SCALE_STORAGE_KEY = 'sigerh_contraloria_scale_v1';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading stored employees:', e);
    }
    return INITIAL_EMPLOYEES;
  });

  const [vacationScale, setVacationScale] = useState<VacationScaleRule[]>(() => {
    try {
      const saved = localStorage.getItem(SCALE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading stored vacation scale:', e);
    }
    return DEFAULT_VACATION_SCALE_RULES;
  });

  const [currentView, setCurrentView] = useState<'empleados' | 'vacaciones' | 'permisos' | 'nomina'>('empleados');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Modals state
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isVacationScaleModalOpen, setIsVacationScaleModalOpen] = useState(false);

  // Sync employees to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch (e) {
      console.error('Error saving employees to localStorage:', e);
    }
  }, [employees]);

  // Sync vacation scale to local storage
  useEffect(() => {
    try {
      localStorage.setItem(SCALE_STORAGE_KEY, JSON.stringify(vacationScale));
    } catch (e) {
      console.error('Error saving scale to localStorage:', e);
    }
  }, [vacationScale]);

  // Selected employee object
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) || null;

  // Active vacation alerts count using the dynamic vacation scale
  const activeAlertsCount = employees.filter((e) => checkVacationAlert(e, vacationScale) !== null).length;

  // Active leaves count
  const activeLeavesCount = employees.reduce(
    (acc, emp) => acc + emp.medicalLeaves.filter((l) => l.status === 'activo').length,
    0
  );

  // Handlers
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
  };

  const handleBackToList = () => {
    setSelectedEmployeeId(null);
  };

  const handleUpdateEmployee = (updated: Employee) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === updated.id ? updated : emp))
    );
  };

  const handleCreateOrUpdateEmployee = (emp: Employee) => {
    setEmployees((prev) => {
      const exists = prev.some((e) => e.id === emp.id);
      if (exists) {
        return prev.map((e) => (e.id === emp.id ? emp : e));
      } else {
        return [emp, ...prev];
      }
    });

    // Automatically navigate to the newly added/edited employee's page!
    setSelectedEmployeeId(emp.id);
  };

  const handleDeleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;

    if (
      confirm(
        `¿Está seguro de eliminar el registro del funcionario ${emp.firstName} ${emp.lastName} (C.I. ${emp.idCard})? Esta acción no se puede deshacer.`
      )
    ) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      if (selectedEmployeeId === id) {
        setSelectedEmployeeId(null);
      }
    }
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenNewEmployeeModal = () => {
    setEditingEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveScale = (newScale: VacationScaleRule[]) => {
    setVacationScale(newScale);
  };

  // Export JSON backup (both employees and vacation scale rules)
  const handleExportData = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      institution: 'Contraloría Municipal',
      scale: vacationScale,
      employees,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `SIGERH_Respaldo_Contraloria_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Direct array of employees
          if (confirm(`Se han detectado ${parsed.length} funcionarios. ¿Desea restaurar esta base de datos?`)) {
            setEmployees(parsed);
            setSelectedEmployeeId(null);
            alert('¡Base de datos restaurada con éxito!');
          }
        } else if (parsed && Array.isArray(parsed.employees)) {
          // Object with employees and scale
          if (confirm(`Se han detectado ${parsed.employees.length} funcionarios y escala de vacaciones en el archivo. ¿Desea restaurar?`)) {
            setEmployees(parsed.employees);
            if (Array.isArray(parsed.scale) && parsed.scale.length > 0) {
              setVacationScale(parsed.scale);
            }
            setSelectedEmployeeId(null);
            alert('¡Base de datos y escala de vacaciones restauradas con éxito!');
          }
        } else {
          alert('El archivo no contiene un formato de respaldo válido de SIGERH.');
        }
      } catch (err) {
        alert('Error al procesar el archivo JSON de respaldo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedEmployeeId(null); // return to section root
        }}
        onOpenNewEmployeeModal={handleOpenNewEmployeeModal}
        onOpenVacationScaleModal={() => setIsVacationScaleModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        employees={employees}
        activeAlertsCount={activeAlertsCount}
        activeLeavesCount={activeLeavesCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {selectedEmployee ? (
          /* Individual Worker Page ("QUE ME PUEDAD DAR UNA PAGINA PARA CADA TRABAJADOR QUE AGREGUE") */
          <EmployeeProfilePage
            employee={selectedEmployee}
            allEmployees={employees}
            scale={vacationScale}
            onSaveScale={handleSaveScale}
            onSelectEmployee={handleSelectEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onBackToList={handleBackToList}
          />
        ) : currentView === 'empleados' ? (
          <EmployeeListView
            employees={employees}
            onSelectEmployee={handleSelectEmployee}
            onEditEmployee={handleOpenEditModal}
            onDeleteEmployee={handleDeleteEmployee}
            onOpenNewEmployeeModal={handleOpenNewEmployeeModal}
          />
        ) : currentView === 'vacaciones' ? (
          <VacationsView
            employees={employees}
            scale={vacationScale}
            onOpenScaleModal={() => setIsVacationScaleModalOpen(true)}
            onSelectEmployee={handleSelectEmployee}
          />
        ) : currentView === 'permisos' ? (
          <PermissionsLeavesView
            employees={employees}
            onSelectEmployee={handleSelectEmployee}
          />
        ) : (
          <PayrollView
            employees={employees}
            onSelectEmployee={handleSelectEmployee}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 px-4 sm:px-8 mt-12 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-bold text-slate-200">
              REPÚBLICA BOLIVARIANA DE VENEZUELA · CONTRALORÍA MUNICIPAL
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sistema Integral de Gestión de Recursos Humanos (SIGERH) · Ley del Estatuto de la Función Pública
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Escala Reglamentaria Configurable ({vacationScale.length} tramos)</span>
            <span>·</span>
            <span>Cómputo de Antigüedad Dinámico</span>
            <span>·</span>
            <span className="font-mono text-slate-300">Año 2026</span>
          </div>
        </div>
      </footer>

      {/* Modal for Creating or Editing Employee */}
      {isEmployeeModalOpen && (
        <EmployeeModal
          initialEmployee={editingEmployee}
          onSave={handleCreateOrUpdateEmployee}
          onClose={() => {
            setIsEmployeeModalOpen(false);
            setEditingEmployee(null);
          }}
        />
      )}

      {/* Modal for Registering and Configuring Vacation Scale */}
      {isVacationScaleModalOpen && (
        <VacationScaleModal
          currentScale={vacationScale}
          onSaveScale={handleSaveScale}
          onClose={() => setIsVacationScaleModalOpen(false)}
        />
      )}
    </div>
  );
}
