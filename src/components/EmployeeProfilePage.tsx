import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Briefcase,
  User,
  Users,
  FileText,
  FileCheck,
  AlertTriangle,
  Upload,
  Download,
  Eye,
  Plus,
  Trash2,
  Edit2,
  Printer,
  DollarSign,
  HeartPulse,
  Award,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle2,
  HelpCircle,
  Scale,
  Settings,
  Camera,
  History
} from 'lucide-react';
import {
  Employee,
  Child,
  Spouse,
  DigitalDocument,
  VacationRecord,
  PermissionRecord,
  MedicalLeaveRecord,
  SalaryStructure,
  VacationScaleRule
} from '../types/employee';
import {
  calculateExactDuration,
  calculateTotalSeniority,
  calculateMunicipalSeniority,
  calculateAge,
  getVacationDaysByYears,
  getVacationRuleDescription,
  DEFAULT_VACATION_SCALE_RULES,
  checkVacationAlert,
  calculateSalaryTotals,
  formatCurrency,
  formatDateES
} from '../utils/hrCalculations';
import { DocumentViewerModal } from './DocumentViewerModal';
import { VacationModal } from './VacationModal';
import { PermissionModal } from './PermissionModal';
import { MedicalLeaveModal } from './MedicalLeaveModal';
import { PrintPaySlipModal } from './PrintPaySlipModal';
import { SeniorityModal } from './SeniorityModal';
import { VacationScaleModal } from './VacationScaleModal';

interface EmployeeProfilePageProps {
  employee: Employee;
  allEmployees: Employee[];
  scale?: VacationScaleRule[];
  onSaveScale?: (updatedScale: VacationScaleRule[]) => void;
  onSelectEmployee: (emp: Employee) => void;
  onUpdateEmployee: (updated: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onBackToList: () => void;
}

type TabType = 'expediente' | 'documentos' | 'antiguedad_vacaciones' | 'permisos_reposos' | 'salarial';

export const EmployeeProfilePage: React.FC<EmployeeProfilePageProps> = ({
  employee,
  allEmployees,
  scale = DEFAULT_VACATION_SCALE_RULES,
  onSaveScale,
  onSelectEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onBackToList,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('expediente');

  // Modals state
  const [viewingDoc, setViewingDoc] = useState<DigitalDocument | null>(null);
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isMedicalLeaveModalOpen, setIsMedicalLeaveModalOpen] = useState(false);
  const [isPaySlipModalOpen, setIsPaySlipModalOpen] = useState(false);
  const [isSeniorityModalOpen, setIsSeniorityModalOpen] = useState(false);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);

  // Quick edit spouse modal / state
  const [isEditingSpouse, setIsEditingSpouse] = useState(false);
  const [spouseForm, setSpouseForm] = useState<Spouse>(
    employee.spouse || {
      fullName: '',
      idCard: '',
      birthDate: '',
      phone: '',
      occupation: '',
      isLegallyMarried: true,
    }
  );

  // Quick child add / edit state
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [childForm, setChildForm] = useState<Omit<Child, 'id'>>({
    fullName: '',
    idCard: 'Menor de edad',
    birthDate: '2018-01-01',
    gender: 'M',
    educationLevel: 'Primaria',
    hasSpecialCondition: false,
    conditionNotes: '',
  });

  // Salary editing state
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState<SalaryStructure>({ ...employee.salary });

  // File upload refs for CV, Gaceta and Photo
  const cvFileInputRef = useRef<HTMLInputElement>(null);
  const gacetaFileInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // Calculate durations and total recognized seniority
  const publicAdminDuration = calculateExactDuration(employee.publicAdminEntryDate);
  const municipalAuditDuration = calculateExactDuration(employee.municipalAuditEntryDate);
  const municipalSeniorityDuration = calculateMunicipalSeniority(employee);
  const totalSeniority = calculateTotalSeniority(employee);
  const vacationAlert = checkVacationAlert(employee, scale);
  const salaryTotals = calculateSalaryTotals(employee.salary);
  const currentVacationDays = getVacationDaysByYears(totalSeniority.totalYears, scale);

  // Handle uploading Photo directly from profile
  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpdateEmployee({
        ...employee,
        photoUrl: reader.result as string,
        updatedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (!confirm('¿Desea eliminar la fotografía de este funcionario?')) return;
    onUpdateEmployee({
      ...employee,
      photoUrl: undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  // Handle uploading Curriculum Vitae
  const handleUploadCV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const newDoc: DigitalDocument = {
        id: `doc-cv-${Date.now()}`,
        type: 'curriculum',
        title: `Currículum Vitae (${file.name})`,
        fileName: file.name,
        fileDataUrl: resultStr,
        fileType: file.type || 'application/pdf',
        uploadDate: new Date().toISOString().split('T')[0],
        notes: 'Documento cargado desde el sistema de Recursos Humanos.',
      };

      const updatedDocs = [
        ...employee.documents.filter((d) => d.type !== 'curriculum'),
        newDoc,
      ];

      onUpdateEmployee({
        ...employee,
        curriculumDoc: newDoc,
        documents: updatedDocs,
        updatedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle uploading Gaceta Oficial / Nombramiento
  const handleUploadGaceta = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const gazNumber = prompt('Ingrese el Número de Gaceta Oficial (ej. Gaceta Municipal N° 1.840):', employee.gacetaDoc?.gazetteNumber || 'Gaceta Municipal N° ');
      const resNumber = prompt('Ingrese el Número de Resolución o Decreto:', employee.gacetaDoc?.resolutionNumber || 'Resolución CM-');

      const newDoc: DigitalDocument = {
        id: `doc-gaceta-${Date.now()}`,
        type: 'gaceta',
        title: `Gaceta Oficial de Nombramiento (${gazNumber || file.name})`,
        fileName: file.name,
        fileDataUrl: resultStr,
        fileType: file.type || 'application/pdf',
        uploadDate: new Date().toISOString().split('T')[0],
        gazetteNumber: gazNumber || 'Gaceta Municipal',
        gazetteDate: new Date().toISOString().split('T')[0],
        resolutionNumber: resNumber || undefined,
        notes: 'Gaceta y Resolución de Nombramiento debidamente digitalizada.',
      };

      const updatedDocs = [
        ...employee.documents.filter((d) => d.type !== 'gaceta'),
        newDoc,
      ];

      onUpdateEmployee({
        ...employee,
        gacetaDoc: newDoc,
        documents: updatedDocs,
        updatedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  // Save Spouse
  const handleSaveSpouse = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmployee({
      ...employee,
      spouse: spouseForm.fullName.trim() ? spouseForm : undefined,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingSpouse(false);
  };

  // Add Child
  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childForm.fullName.trim()) return;

    const newChild: Child = {
      ...childForm,
      id: `child-${Date.now()}`,
    };

    onUpdateEmployee({
      ...employee,
      children: [...employee.children, newChild],
      updatedAt: new Date().toISOString(),
    });

    setChildForm({
      fullName: '',
      idCard: 'Menor de edad',
      birthDate: '2018-01-01',
      gender: 'M',
      educationLevel: 'Primaria',
      hasSpecialCondition: false,
      conditionNotes: '',
    });
    setIsAddingChild(false);
  };

  // Remove Child
  const handleRemoveChild = (childId: string) => {
    if (!confirm('¿Desea eliminar este registro de carga familiar (hijo)?')) return;
    onUpdateEmployee({
      ...employee,
      children: employee.children.filter((c) => c.id !== childId),
      updatedAt: new Date().toISOString(),
    });
  };

  // Save Salary Structure Changes
  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmployee({
      ...employee,
      salary: salaryForm,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingSalary(false);
  };

  // Add Vacation Record
  const handleSaveVacation = (newVac: VacationRecord) => {
    onUpdateEmployee({
      ...employee,
      vacations: [newVac, ...employee.vacations],
      updatedAt: new Date().toISOString(),
    });
  };

  // Add Permission Record
  const handleSavePermission = (newPerm: PermissionRecord) => {
    onUpdateEmployee({
      ...employee,
      permissions: [newPerm, ...employee.permissions],
      updatedAt: new Date().toISOString(),
    });
  };

  // Add Medical Leave Record
  const handleSaveMedicalLeave = (newLeave: MedicalLeaveRecord) => {
    onUpdateEmployee({
      ...employee,
      status: newLeave.status === 'activo' ? 'reposo' : employee.status,
      medicalLeaves: [newLeave, ...employee.medicalLeaves],
      updatedAt: new Date().toISOString(),
    });
  };

  // Active status color helper
  const getStatusBadge = (st: Employee['status']) => {
    switch (st) {
      case 'activo':
        return <span className="text-emerald-700 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Activo en funciones</span>;
      case 'vacaciones':
        return <span className="text-blue-700 font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-600" /> En Disfrute de Vacaciones</span>;
      case 'reposo':
        return <span className="text-rose-700 font-semibold flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5 text-rose-600" /> En Reposo Médico</span>;
      case 'permiso':
        return <span className="text-amber-700 font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-600" /> Con Permiso Autorizado</span>;
      default:
        return <span className="text-slate-600 font-semibold">{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Employee Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onBackToList}
            className="flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Lista de Empleados
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">Expediente Individual</span>
          <span className="text-slate-300">/</span>
          <span className="font-mono font-bold text-slate-800">{employee.idCard}</span>
        </div>

        {/* Quick employee switcher dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 hidden sm:inline">Cambiar de Funcionario:</label>
          <select
            value={employee.id}
            onChange={(e) => {
              const selected = allEmployees.find((emp) => emp.id === e.target.value);
              if (selected) onSelectEmployee(selected);
            }}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {allEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.idCard} · {emp.firstName} {emp.lastName} ({emp.jobTitle})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top ribbon indicating Public Admin & Municipal Comptroller entity */}
        <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2 font-medium">
            <Building className="w-4 h-4 text-blue-400" />
            <span>República Bolivariana de Venezuela · Contraloría Municipal</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Dirección de Recursos Humanos</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Código Expediente: EXP-{employee.idCard.replace(/[^0-9]/g, '')}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Photo or Initials Avatar with Direct Upload & Change Option */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative group">
                  {employee.photoUrl ? (
                    <img
                      src={employee.photoUrl}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-2xl border-2 border-blue-950 shadow-xs">
                      {employee.firstName.charAt(0)}
                      {employee.lastName.charAt(0)}
                    </div>
                  )}

                  {/* Hidden file input for photo */}
                  <input
                    type="file"
                    ref={photoFileInputRef}
                    accept="image/*"
                    onChange={handleUploadPhoto}
                    className="hidden"
                  />

                  {/* Hover Overlay Button to Change Photo */}
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    title="Subir o cambiar fotografía del funcionario"
                    className="absolute inset-0 bg-slate-900/70 rounded-xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[10px] font-semibold gap-1 cursor-pointer backdrop-blur-2xs"
                  >
                    <Camera className="w-5 h-5 text-white" />
                    <span>{employee.photoUrl ? 'Cambiar' : 'Subir Foto'}</span>
                  </button>

                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs border border-slate-200">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                {/* Direct quick action buttons for touch & clarity */}
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    {employee.photoUrl ? 'Cambiar Foto' : 'Subir Foto'}
                  </button>
                  {employee.photoUrl && (
                    <>
                      <span className="text-slate-300">·</span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                      >
                        Quitar
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {employee.firstName} {employee.lastName}
                  </h1>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                    C.I. {employee.idCard}
                  </span>
                </div>

                <div className="text-xs font-semibold text-blue-900 mb-2">
                  {employee.jobTitle} · <span className="text-slate-600 font-normal">{employee.department}</span>
                </div>

                {/* Metadata strip */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {getStatusBadge(employee.status)}
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-700">Tipo: {employee.employmentType}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {employee.phone}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {employee.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <button
                onClick={() => setIsPaySlipModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <DollarSign className="w-4 h-4" />
                Recibo de Pago
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Imprimir Expediente
              </button>
            </div>
          </div>

          {/* Real-time Anniversary & Vacation Alert Banner if triggered */}
          {vacationAlert && (
            <div className={`mt-5 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              vacationAlert.alertType === 'cumplido'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${
                  vacationAlert.alertType === 'cumplido' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-xs uppercase tracking-wide">
                      {vacationAlert.alertType === 'cumplido'
                        ? '¡Alerta de Cumplimiento de Año de Servicio!'
                        : 'Alerta Preventiva de Vacaciones Reglamentarias'}
                    </h2>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-mono font-bold text-[10px] rounded">
                      {vacationAlert.entitledDays} DÍAS CORRESPONDIENTES
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">
                    {vacationAlert.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsVacationModalOpen(true)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs"
              >
                Registrar Vacaciones Ahora
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 px-6 bg-slate-100/70 border-t border-slate-200 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('expediente')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'expediente'
                ? 'border-blue-600 text-blue-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            1. Datos Personales & Carga Familiar ({employee.children.length} {employee.children.length === 1 ? 'hijo' : 'hijos'})
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'documentos'
                ? 'border-blue-600 text-blue-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Currículum & Gaceta Digital
          </button>

          <button
            onClick={() => setActiveTab('antiguedad_vacaciones')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'antiguedad_vacaciones'
                ? 'border-blue-600 text-blue-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            3. Antigüedad & Escala de Vacaciones
            {vacationAlert && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
          </button>

          <button
            onClick={() => setActiveTab('permisos_reposos')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'permisos_reposos'
                ? 'border-blue-600 text-blue-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            4. Permisos & Reposos Médicos ({employee.permissions.length + employee.medicalLeaves.length})
          </button>

          <button
            onClick={() => setActiveTab('salarial')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'salarial'
                ? 'border-blue-600 text-blue-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            5. Asignaciones Salariales & Nómina
          </button>
        </div>
      </div>

      {/* Tab 1: Expediente General y Carga Familiar */}
      {activeTab === 'expediente' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Datos Personales Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Datos Personales
              </h2>
              <span className="text-[11px] font-mono text-slate-500">C.I. {employee.idCard}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Nombres:</span>
                <span className="font-semibold text-slate-900">{employee.firstName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Apellidos:</span>
                <span className="font-semibold text-slate-900">{employee.lastName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fecha Nacimiento:</span>
                <span className="font-medium text-slate-800">{formatDateES(employee.birthDate)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Edad:</span>
                <span className="font-medium text-slate-800">{calculateAge(employee.birthDate)} años cumplidos</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sexo / Género:</span>
                <span className="font-medium text-slate-800">{employee.gender === 'F' ? 'Femenino' : 'Masculino'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Estado Civil:</span>
                <span className="font-medium text-slate-800 capitalize">{employee.civilStatus}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Dirección de Domicilio:</span>
                <span className="text-slate-800">{employee.address}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Teléfono Móvil:</span>
                <span className="font-mono text-slate-800">{employee.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Correo Institucional:</span>
                <span className="font-mono text-slate-800">{employee.email}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <span className="text-[11px] font-bold uppercase text-slate-500 block mb-2">Datos Bancarios para Nómina</span>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                <p className="font-semibold text-slate-800">{employee.bankName || 'Banco de Venezuela'}</p>
                <p className="font-mono text-slate-600 text-[11px]">{employee.bankAccount || 'No asignada aún'}</p>
              </div>
            </div>
          </div>

          {/* Datos del Cónyuge / Esposo(a) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Cónyuge / Esposo(a)
              </h2>
              <button
                onClick={() => setIsEditingSpouse(!isEditingSpouse)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {employee.spouse ? 'Modificar' : '+ Agregar'}
              </button>
            </div>

            {isEditingSpouse ? (
              <form onSubmit={handleSaveSpouse} className="space-y-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre Completo del Cónyuge:</label>
                  <input
                    type="text"
                    value={spouseForm.fullName}
                    onChange={(e) => setSpouseForm({ ...spouseForm, fullName: e.target.value })}
                    required
                    placeholder="Nombres y Apellidos"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cédula:</label>
                    <input
                      type="text"
                      value={spouseForm.idCard}
                      onChange={(e) => setSpouseForm({ ...spouseForm, idCard: e.target.value })}
                      placeholder="V-XX.XXX.XXX"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Teléfono:</label>
                    <input
                      type="text"
                      value={spouseForm.phone}
                      onChange={(e) => setSpouseForm({ ...spouseForm, phone: e.target.value })}
                      placeholder="0414-XXXXXXX"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fecha Nacimiento:</label>
                    <input
                      type="date"
                      value={spouseForm.birthDate}
                      onChange={(e) => setSpouseForm({ ...spouseForm, birthDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ocupación / Profesión:</label>
                    <input
                      type="text"
                      value={spouseForm.occupation || ''}
                      onChange={(e) => setSpouseForm({ ...spouseForm, occupation: e.target.value })}
                      placeholder="Ej. Docente, Ingeniero"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isLegallyMarried"
                    checked={spouseForm.isLegallyMarried}
                    onChange={(e) => setSpouseForm({ ...spouseForm, isLegallyMarried: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="isLegallyMarried" className="text-slate-700 text-xs">
                    Unión Matrimonial Legal (o Concubinato Notariado)
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingSpouse(false)}
                    className="px-2.5 py-1 bg-slate-200 rounded text-slate-700 text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                  >
                    Guardar Cónyuge
                  </button>
                </div>
              </form>
            ) : employee.spouse ? (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 text-sm">{employee.spouse.fullName}</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">
                      {employee.spouse.isLegallyMarried ? 'Matrimonio Civil' : 'Unión Estable'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500 block">Cédula de Identidad:</span>
                      <span className="font-mono font-bold text-slate-800">{employee.spouse.idCard}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Teléfono:</span>
                      <span className="font-mono text-slate-800">{employee.spouse.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Fecha Nacimiento:</span>
                      <span className="text-slate-800">{formatDateES(employee.spouse.birthDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Ocupación:</span>
                      <span className="text-slate-800">{employee.spouse.occupation || 'No indicada'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No se ha registrado cónyuge para este funcionario.</p>
                <button
                  onClick={() => setIsEditingSpouse(true)}
                  className="mt-2 text-blue-600 hover:underline font-semibold"
                >
                  Registrar datos del esposo(a)
                </button>
              </div>
            )}
          </div>

          {/* Carga Familiar: Hijos */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Hijos ({employee.children.length})
              </h2>
              <button
                onClick={() => setIsAddingChild(!isAddingChild)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                + Agregar Hijo
              </button>
            </div>

            {/* Form for adding child */}
            {isAddingChild && (
              <form onSubmit={handleAddChild} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Nombre Completo:</label>
                  <input
                    type="text"
                    value={childForm.fullName}
                    onChange={(e) => setChildForm({ ...childForm, fullName: e.target.value })}
                    required
                    placeholder="Nombres y Apellidos del hijo(a)"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">Cédula (si posee):</label>
                    <input
                      type="text"
                      value={childForm.idCard}
                      onChange={(e) => setChildForm({ ...childForm, idCard: e.target.value })}
                      placeholder="V- o Menor"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">Fecha Nacimiento:</label>
                    <input
                      type="date"
                      value={childForm.birthDate}
                      onChange={(e) => setChildForm({ ...childForm, birthDate: e.target.value })}
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">Nivel Educativo:</label>
                    <select
                      value={childForm.educationLevel}
                      onChange={(e) => setChildForm({ ...childForm, educationLevel: e.target.value as Child['educationLevel'] })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                    >
                      <option value="Inicial / Maternal">Inicial / Maternal</option>
                      <option value="Primaria">Primaria</option>
                      <option value="Secundaria / Bachillerato">Secundaria / Bachillerato</option>
                      <option value="Técnico Medio">Técnico Medio</option>
                      <option value="Universitario">Universitario</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">Sexo:</label>
                    <select
                      value={childForm.gender}
                      onChange={(e) => setChildForm({ ...childForm, gender: e.target.value as 'M' | 'F' })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="hasSpecialCondition"
                    checked={childForm.hasSpecialCondition}
                    onChange={(e) => setChildForm({ ...childForm, hasSpecialCondition: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <label htmlFor="hasSpecialCondition" className="text-slate-700 text-xs">
                    Condición Especial (Aplica Prima Especial)
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddingChild(false)}
                    className="px-2.5 py-1 bg-slate-200 rounded text-slate-700 text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-700 text-white rounded text-xs font-semibold"
                  >
                    Guardar Hijo
                  </button>
                </div>
              </form>
            )}

            {/* List of children */}
            {employee.children.length > 0 ? (
              <div className="space-y-2.5">
                {employee.children.map((child) => {
                  const age = calculateAge(child.birthDate);
                  return (
                    <div
                      key={child.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200 transition-colors flex items-start justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{child.fullName}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600">
                            {child.idCard}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                          <span className="font-bold text-emerald-800">{age} años</span>
                          <span>·</span>
                          <span>Nac: {formatDateES(child.birthDate)}</span>
                          <span>·</span>
                          <span className="text-slate-500">{child.educationLevel}</span>
                          {child.hasSpecialCondition && (
                            <span className="text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                              Condición Especial
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveChild(child.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No posee hijos registrados en el expediente.</p>
                <button
                  onClick={() => setIsAddingChild(true)}
                  className="mt-2 text-emerald-700 hover:underline font-semibold"
                >
                  Registrar primer hijo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Documentos Digitales (Curriculum y Gaceta) */}
      {activeTab === 'documentos' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 flex items-start gap-3">
            <FileCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-950">
                Archivo Digital del Funcionario · Currículum y Gaceta Oficial de Nombramiento
              </p>
              <p className="text-blue-800 text-[11px] mt-0.5">
                Cargue y conserve los archivos digitales obligatorios del funcionario público. Puede subir archivos PDF o imágenes directamente desde su equipo para su consulta inmediata y descarga.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta de Currículum Vitae */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-800">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Currículum Vitae (CV)</h3>
                      <p className="text-[11px] text-slate-500">Hoja de Vida Profesional y Soporte Académico</p>
                    </div>
                  </div>
                  {employee.curriculumDoc ? (
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Consignado
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Pendiente
                    </span>
                  )}
                </div>

                {employee.curriculumDoc ? (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Título del Archivo:</span>
                      <span className="font-bold text-slate-900">{employee.curriculumDoc.title}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Nombre de Archivo:</span>
                        <code className="text-slate-800 font-mono text-[10px] break-all">
                          {employee.curriculumDoc.fileName}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Fecha de Carga:</span>
                        <span className="text-slate-800 font-medium">
                          {formatDateES(employee.curriculumDoc.uploadDate)}
                        </span>
                      </div>
                    </div>
                    {employee.curriculumDoc.notes && (
                      <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                        {employee.curriculumDoc.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium">No se ha cargado el Currículum Vitae</p>
                    <p className="text-[11px] text-slate-400">Suba el archivo en formato PDF, DOC o Imagen</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2 mt-4">
                <input
                  type="file"
                  ref={cvFileInputRef}
                  onChange={handleUploadCV}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => cvFileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  {employee.curriculumDoc ? 'Actualizar / Cargar Nuevo CV' : 'Cargar Currículum Vitae'}
                </button>

                {employee.curriculumDoc && (
                  <button
                    type="button"
                    onClick={() => setViewingDoc(employee.curriculumDoc!)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Documento
                  </button>
                )}
              </div>
            </div>

            {/* Tarjeta de Gaceta Oficial / Resolución de Nombramiento */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-900">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Gaceta Oficial / Nombramiento</h3>
                      <p className="text-[11px] text-slate-500">Acto Administrativo de Toma de Posesión</p>
                    </div>
                  </div>
                  {employee.gacetaDoc ? (
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Registrada
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Sin Gaceta
                    </span>
                  )}
                </div>

                {employee.gacetaDoc ? (
                  <div className="space-y-3 bg-amber-50/50 p-4 rounded-lg border border-amber-200/70 text-xs">
                    <div>
                      <span className="text-amber-800 block text-[11px] font-bold">Número de Gaceta Oficial:</span>
                      <span className="font-extrabold text-amber-950 text-sm">
                        {employee.gacetaDoc.gazetteNumber || 'Gaceta Municipal Registrada'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-amber-800 block">N° de Resolución:</span>
                        <code className="text-amber-950 font-mono font-bold text-[11px]">
                          {employee.gacetaDoc.resolutionNumber || 'Sin número registrado'}
                        </code>
                      </div>
                      <div>
                        <span className="text-amber-800 block">Fecha de Publicación:</span>
                        <span className="text-amber-950 font-medium">
                          {formatDateES(employee.gacetaDoc.gazetteDate || employee.gacetaDoc.uploadDate)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-amber-800 block text-[10px]">Archivo Adjunto:</span>
                      <code className="text-amber-900 font-mono text-[10px] break-all">
                        {employee.gacetaDoc.fileName}
                      </code>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs">
                    <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium">No se ha registrado la Gaceta Oficial de Nombramiento</p>
                    <p className="text-[11px] text-slate-400">Suba el decreto o resolución publicada en Gaceta Municipal</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2 mt-4">
                <input
                  type="file"
                  ref={gacetaFileInputRef}
                  onChange={handleUploadGaceta}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => gacetaFileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  {employee.gacetaDoc ? 'Actualizar / Cargar Nueva Gaceta' : 'Cargar Gaceta de Nombramiento'}
                </button>

                {employee.gacetaDoc && (
                  <button
                    type="button"
                    onClick={() => setViewingDoc(employee.gacetaDoc!)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Gaceta
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Antigüedad y Escala de Vacaciones */}
      {activeTab === 'antiguedad_vacaciones' && (
        <div className="space-y-6">
          {/* Top Actions for Seniority & Scale Registration */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Cómputo de Antigüedad y Régimen de Vacaciones
              </h3>
              <p className="text-[11px] text-slate-500">
                Gestión de fechas de ingreso, reconocimiento de servicios anteriores y escala de días
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSeniorityModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                Registrar / Ajustar Antigüedad
              </button>
              <button
                type="button"
                onClick={() => setIsScaleModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Scale className="w-4 h-4" />
                Configurar Escala de Vacaciones
              </button>
            </div>
          </div>

          {/* Consolidated Seniority Highlight Card */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-xl shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block">
                    Antigüedad Total Reconocida en la Administración Pública:
                  </span>
                  {totalSeniority.isDiscontinuous ? (
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-mono font-bold text-[10px] rounded uppercase flex items-center gap-1 shadow-xs">
                      <History className="w-3 h-3" />
                      Servicios No Continuos (Manual)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-800 text-blue-200 font-mono font-semibold text-[10px] rounded uppercase">
                      Servicio Continuo
                    </span>
                  )}
                </div>

                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
                  {totalSeniority.formattedTotal}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-blue-200 mt-2 font-mono">
                  {totalSeniority.isDiscontinuous ? (
                    <>
                      <span className="text-amber-300 font-bold">
                        Total Acumulado: {totalSeniority.totalYears}a, {totalSeniority.totalMonths}m, {totalSeniority.totalDays}d
                      </span>
                      <span>·</span>
                      <span>Permanencia en Contraloría: {municipalSeniorityDuration.formatted}</span>
                    </>
                  ) : (
                    <>
                      <span>Adm. Pública: {publicAdminDuration.years}a, {publicAdminDuration.months}m, {publicAdminDuration.days}d</span>
                      {totalSeniority.hasRecognizedPrior && (
                        <>
                          <span>+</span>
                          <span className="text-amber-300 font-bold">
                            Acreditados: {totalSeniority.priorYears}a, {totalSeniority.priorMonths}m, {totalSeniority.priorDays}d
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span>Permanencia en Contraloría: {municipalSeniorityDuration.formatted}</span>
                    </>
                  )}
                </div>

                {totalSeniority.isDiscontinuous && totalSeniority.discontinuousNotes && (
                  <div className="mt-3 p-2.5 bg-white/10 rounded-lg text-xs text-amber-200 border border-white/10 flex items-start gap-2">
                    <History className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block text-[11px]">Relación de periodos discontinuos:</strong>
                      <span className="text-[11px] text-blue-100">{totalSeniority.discontinuousNotes}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 text-center shrink-0">
                <span className="text-[10px] uppercase font-bold text-blue-200 block">Días según Escala Activa:</span>
                <div className="text-3xl font-black font-mono text-amber-300 mt-0.5">
                  {currentVacationDays} días
                </div>
                <span className="text-[10px] text-white/80 block mt-0.5">Hábiles remunerados</span>
              </div>
            </div>
          </div>

          {/* Dual Service Time Counters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha Ingreso Administración Pública */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${totalSeniority.isDiscontinuous ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
                    {totalSeniority.isDiscontinuous ? <History className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                        Administración Pública
                      </h3>
                      {totalSeniority.isDiscontinuous && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded font-mono">
                          Discontinuo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {totalSeniority.isDiscontinuous
                        ? `Cómputo acumulado en expediente (Ingreso ref: ${formatDateES(employee.publicAdminEntryDate)})`
                        : `Fecha de Ingreso: ${formatDateES(employee.publicAdminEntryDate)}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSeniorityModalOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Ajustar
                </button>
              </div>

              {/* Exact Duration Big Counter */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {totalSeniority.isDiscontinuous ? 'Tiempo Total Efectivo Acumulado:' : 'Tiempo Transcurrido desde Fecha de Ingreso:'}
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-blue-950 font-mono mt-1">
                  {totalSeniority.isDiscontinuous ? totalSeniority.formattedTotal : publicAdminDuration.formatted}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200 font-mono">
                  {totalSeniority.isDiscontinuous ? (
                    <>
                      <span><strong>{totalSeniority.totalYears}</strong> años</span>
                      <span>·</span>
                      <span><strong>{totalSeniority.totalMonths}</strong> meses</span>
                      <span>·</span>
                      <span><strong>{totalSeniority.totalDays}</strong> días</span>
                    </>
                  ) : (
                    <>
                      <span><strong>{publicAdminDuration.years}</strong> años</span>
                      <span>·</span>
                      <span><strong>{publicAdminDuration.months}</strong> meses</span>
                      <span>·</span>
                      <span><strong>{publicAdminDuration.days}</strong> días</span>
                      <span>·</span>
                      <span className="text-[11px] text-slate-400">({publicAdminDuration.totalDays} días totales)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Reconocimiento de Servicios Anteriores o Notas de Discontinuidad */}
              {totalSeniority.isDiscontinuous ? (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-1">
                  <span className="font-bold text-amber-950 uppercase text-[10px] block">
                    Observaciones de Servicios No Continuos:
                  </span>
                  <p className="text-amber-900 text-[11px] leading-relaxed">
                    {totalSeniority.discontinuousNotes || 'Tiempo computado manualmente por lapsos discontinuos de servicio público.'}
                  </p>
                  {employee.recognizedServiceResolution && (
                    <p className="text-amber-800 text-[11px] font-mono pt-1 border-t border-amber-200">
                      Resolución / Auto: <strong>{employee.recognizedServiceResolution}</strong>
                      {employee.recognizedServiceDate && ` (${formatDateES(employee.recognizedServiceDate)})`}
                    </p>
                  )}
                </div>
              ) : totalSeniority.hasRecognizedPrior ? (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs space-y-1">
                  <span className="font-bold text-purple-950 uppercase text-[10px] block">
                    Servicios Anteriores Reconocidos (Acreditación):
                  </span>
                  <p className="text-purple-900 font-medium">
                    +{totalSeniority.priorYears} años, {totalSeniority.priorMonths} meses y {totalSeniority.priorDays} días acreditados.
                  </p>
                  {employee.recognizedServiceEntity && (
                    <p className="text-purple-800 text-[11px]">
                      Ente Emisor: <strong>{employee.recognizedServiceEntity}</strong>
                    </p>
                  )}
                  {employee.recognizedServiceResolution && (
                    <p className="text-purple-800 text-[11px] font-mono">
                      Resolución: <strong>{employee.recognizedServiceResolution}</strong>
                      {employee.recognizedServiceDate && ` (${formatDateES(employee.recognizedServiceDate)})`}
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            {/* Fecha Ingreso Contraloría Municipal */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-amber-900 rounded-lg">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Ingreso a la Contraloría Municipal
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Fecha: {formatDateES(employee.municipalAuditEntryDate)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSeniorityModalOpen(true)}
                  className="text-xs text-amber-700 hover:text-amber-900 font-semibold cursor-pointer"
                >
                  Ajustar
                </button>
              </div>

              {/* Exact Duration Big Counter */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Tiempo de Permanencia en la Contraloría:
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-amber-950 font-mono mt-1">
                  {municipalSeniorityDuration.formatted}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200 font-mono">
                  <span><strong>{municipalSeniorityDuration.years}</strong> años</span>
                  <span>·</span>
                  <span><strong>{municipalSeniorityDuration.months}</strong> meses</span>
                  <span>·</span>
                  <span><strong>{municipalSeniorityDuration.days}</strong> días</span>
                  {municipalSeniorityDuration.totalDays > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-[11px] text-slate-400">({municipalSeniorityDuration.totalDays} días totales)</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Antigüedad específica en la institución de control fiscal municipal para ascensos, condecoraciones y bonos de permanencia.
              </p>
            </div>
          </div>

          {/* Institutional Vacation Scale Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Escala Vigente de Vacaciones Anuales ({scale.length} Tramos Registrados)
                </h3>
                <p className="text-xs text-slate-500">
                  Días hábiles de disfrute vacacional remunerado por tramo de antigüedad cumplida
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsScaleModalOpen(true)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Modificar Escala
                </button>
                <span className="font-mono font-bold text-xs px-2.5 py-1 bg-blue-100 text-blue-900 rounded-md">
                  {currentVacationDays} DÍAS HÁBILES
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Tramo de Años de Servicio</th>
                    <th className="py-2.5 px-4">Días de Vacaciones Hábiles</th>
                    <th className="py-2.5 px-4">Fundamento Normativo</th>
                    <th className="py-2.5 px-4 text-center">Estado para el Funcionario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {scale.map((rule) => {
                    const isCurrentTier =
                      totalSeniority.totalYears >= rule.minYears &&
                      totalSeniority.totalYears <= rule.maxYears;

                    return (
                      <tr
                        key={rule.id || rule.label}
                        className={`transition-colors ${
                          isCurrentTier
                            ? 'bg-blue-50/80 font-semibold text-blue-950 border-l-4 border-l-blue-600'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                          {isCurrentTier && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                          {rule.label}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-sm text-blue-900">
                          {rule.days} días
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                          {rule.legalBasis || 'Ley del Estatuto de la Función Pública'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {isCurrentTier ? (
                            <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Tramo Aplicable Actual ({totalSeniority.totalYears} años)
                            </span>
                          ) : totalSeniority.totalYears > rule.maxYears ? (
                            <span className="text-[11px] text-slate-400">Cumplido en años anteriores</span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Próximos periodos</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Vacation History & Record Request */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Histórico de Periodos de Vacaciones Registrados ({employee.vacations.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Control de periodos disfrutados y saldos pendientes
                </p>
              </div>
              <button
                onClick={() => setIsVacationModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                + Registrar Periodo Vacacional
              </button>
            </div>

            {employee.vacations.length > 0 ? (
              <div className="space-y-2">
                {employee.vacations.map((vac) => (
                  <div
                    key={vac.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">Periodo {vac.period}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          vac.status === 'disfrutadas' ? 'bg-emerald-100 text-emerald-800' :
                          vac.status === 'en_curso' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {vac.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-3">
                        <span>Total Correspondiente: <strong>{vac.correspondingDays} días</strong></span>
                        <span>·</span>
                        <span>Disfrutados: <strong>{vac.daysTaken} días</strong></span>
                        <span>·</span>
                        <span>Saldo Pendiente: <strong className="text-blue-700">{vac.daysRemaining} días</strong></span>
                        {vac.resolutionNumber && <span>· Res: <code className="font-mono">{vac.resolutionNumber}</code></span>}
                      </div>
                    </div>
                    {vac.startDate && (
                      <div className="text-right text-[11px] font-mono text-slate-600">
                        <span>Salida: {formatDateES(vac.startDate)}</span>
                        {vac.returnDate && <span className="block text-slate-500">Retorno: {formatDateES(vac.returnDate)}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500 text-xs">
                No hay registros de vacaciones anteriores para este funcionario.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Permisos y Reposos Médicos */}
      {activeTab === 'permisos_reposos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Permisos Solicitados */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 text-blue-900 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Permisos Solicitados</h3>
                    <p className="text-[11px] text-slate-500">
                      Permisos remunerados, diligencias, duelo y comisiones
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPermissionModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Solicitar Permiso
                </button>
              </div>

              {employee.permissions.length > 0 ? (
                <div className="space-y-3">
                  {employee.permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-lg border border-slate-200 text-xs space-y-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 uppercase">
                          {perm.type.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          perm.status === 'aprobado' ? 'bg-emerald-100 text-emerald-800' :
                          perm.status === 'pendiente' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {perm.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-700">
                        <p className="italic">"{perm.reason}"</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200 pt-2 font-mono">
                        <span>Desde: {formatDateES(perm.startDate)} al {formatDateES(perm.endDate)}</span>
                        <span className="font-bold text-slate-800">{perm.workingDays} {perm.workingDays === 1 ? 'día hábil' : 'días hábiles'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500 text-xs">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No cuenta con solicitudes de permisos registradas.</p>
                </div>
              )}
            </div>

            {/* Reposos Médicos */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-100 text-rose-900 rounded-lg">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Reposos Médicos</h3>
                    <p className="text-[11px] text-slate-500">
                      Convalidaciones IVSS, hospitalizaciones y licencias médicas
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMedicalLeaveModalOpen(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Registrar Reposo
                </button>
              </div>

              {employee.medicalLeaves.length > 0 ? (
                <div className="space-y-3">
                  {employee.medicalLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="p-3.5 bg-rose-50/40 hover:bg-rose-50/70 rounded-lg border border-rose-200 text-xs space-y-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-950">
                          {leave.diagnosis}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          leave.status === 'activo' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {leave.status === 'activo' ? 'En Curso' : leave.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                        <div>
                          <span className="text-slate-500 block">Centro Médico:</span>
                          <span>{leave.healthCenter}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Médico Tratante:</span>
                          <span>{leave.doctorName}</span>
                        </div>
                        {leave.ivssValidationCode && (
                          <div className="col-span-2">
                            <span className="text-slate-500 block">Boleta Convalidación IVSS:</span>
                            <span className="font-mono font-bold text-rose-900">{leave.ivssValidationCode}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-rose-200 pt-2 font-mono">
                        <span>Desde: {formatDateES(leave.startDate)} hasta: {formatDateES(leave.endDate)}</span>
                        <span className="font-bold text-rose-800">{leave.totalDays} días continuos</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500 text-xs">
                  <HeartPulse className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No registra reposos médicos vigentes ni históricos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Módulo Salarial, Quincenas, Bonos y Recibo */}
      {activeTab === 'salarial' && (
        <div className="space-y-6">
          {/* Top summary row of the salary breakdown requested explicitly by user */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Quincenas */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 block uppercase font-bold">Quincenas (1 y 2):</span>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                {formatCurrency(salaryTotals.totalQuincenas)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                Q1: {formatCurrency(salaryTotals.q1)} · Q2: {formatCurrency(salaryTotals.q2)}
              </div>
            </div>

            {/* Cesta Ticket */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 block uppercase font-bold">Cesta Ticket (Alimentación):</span>
              <div className="text-lg font-bold font-mono text-emerald-800 mt-1">
                {formatCurrency(salaryTotals.cestaTicket)}
              </div>
              <div className="text-[10px] text-emerald-600 mt-1">
                Bono legal indexado
              </div>
            </div>

            {/* Bono de Responsabilidad */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 block uppercase font-bold">Bono de Responsabilidad:</span>
              <div className="text-lg font-bold font-mono text-blue-900 mt-1">
                {formatCurrency(salaryTotals.bonoResponsabilidad)}
              </div>
              <div className="text-[10px] text-blue-600 mt-1">
                Por nivel y cargo en la Contraloría
              </div>
            </div>

            {/* Bono de Puntualidad */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 block uppercase font-bold">Bono de Puntualidad:</span>
              <div className="text-lg font-bold font-mono text-purple-900 mt-1">
                {formatCurrency(salaryTotals.bonoPuntualidad)}
              </div>
              <div className="text-[10px] text-purple-600 mt-1">
                Incentivo por asistencia continua
              </div>
            </div>
          </div>

          {/* Salary Breakdown & Editor */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Estructura Salarial Detallada del Funcionario
                </h3>
                <p className="text-xs text-slate-500">
                  Conceptos de asignaciones, primas institucionales y deducciones legales
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSalary(!isEditingSalary)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {isEditingSalary ? 'Cancelar Edición' : 'Editar Asignaciones'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaySlipModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  Generar Recibo de Pago Imprimible
                </button>
              </div>
            </div>

            {isEditingSalary ? (
              <form onSubmit={handleSaveSalary} className="space-y-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-300">
                <h4 className="font-bold text-slate-900 uppercase text-xs">Modificar Montos Salariales (Bs.)</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quincena 1 (Día 15):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salaryForm.quincena1}
                      onChange={(e) => setSalaryForm({ ...salaryForm, quincena1: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quincena 2 (Fin de mes):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salaryForm.quincena2}
                      onChange={(e) => setSalaryForm({ ...salaryForm, quincena2: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cesta Ticket (Bono Alimentación):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salaryForm.cestaTicket}
                      onChange={(e) => setSalaryForm({ ...salaryForm, cestaTicket: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bono de Responsabilidad:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salaryForm.bonoResponsabilidad}
                      onChange={(e) => setSalaryForm({ ...salaryForm, bonoResponsabilidad: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bono de Puntualidad:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salaryForm.bonoPuntualidad}
                      onChange={(e) => setSalaryForm({ ...salaryForm, bonoPuntualidad: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Prima de Antigüedad:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salaryForm.primaAntiguedad}
                      onChange={(e) => setSalaryForm({ ...salaryForm, primaAntiguedad: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Prima Profesionalización:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salaryForm.primaProfesionalizacion}
                      onChange={(e) => setSalaryForm({ ...salaryForm, primaProfesionalizacion: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Prima por Hijos:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salaryForm.primaHijos}
                      onChange={(e) => setSalaryForm({ ...salaryForm, primaHijos: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingSalary(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
                  >
                    Guardar Cambios Salariales
                  </button>
                </div>
              </form>
            ) : (
              /* Two column breakdown: Asignaciones and Deducciones */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Asignaciones */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-1 text-emerald-800">
                    Asignaciones Totales (Ingresos)
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Sueldo Básico Quincena 1 (Día 15):</span>
                      <span className="font-mono font-medium">{formatCurrency(salaryTotals.q1)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Sueldo Básico Quincena 2 (Fin de mes):</span>
                      <span className="font-mono font-medium">{formatCurrency(salaryTotals.q2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 bg-emerald-50/50 px-2 rounded">
                      <span className="font-semibold text-emerald-950">Cesta Ticket (Bono Alimentación):</span>
                      <span className="font-mono font-bold text-emerald-800">{formatCurrency(salaryTotals.cestaTicket)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 bg-blue-50/50 px-2 rounded">
                      <span className="font-semibold text-blue-950">Bono de Responsabilidad:</span>
                      <span className="font-mono font-bold text-blue-800">{formatCurrency(salaryTotals.bonoResponsabilidad)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 bg-purple-50/50 px-2 rounded">
                      <span className="font-semibold text-purple-950">Bono de Puntualidad:</span>
                      <span className="font-mono font-bold text-purple-800">{formatCurrency(salaryTotals.bonoPuntualidad)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Prima de Antigüedad:</span>
                      <span className="font-mono">{formatCurrency(salaryTotals.primaAntiguedad)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Prima de Profesionalización:</span>
                      <span className="font-mono">{formatCurrency(salaryTotals.primaProfesionalizacion)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Prima por Carga Familiar (Hijos):</span>
                      <span className="font-mono">{formatCurrency(salaryTotals.primaHijos)}</span>
                    </div>
                    {salaryTotals.otrasAsignaciones > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Otras Asignaciones / Bono Especial:</span>
                        <span className="font-mono">{formatCurrency(salaryTotals.otrasAsignaciones)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t-2 border-slate-300 font-bold text-sm">
                      <span className="text-slate-900">Total Asignaciones:</span>
                      <span className="font-mono text-emerald-800">{formatCurrency(salaryTotals.totalAsignaciones)}</span>
                    </div>
                  </div>
                </div>

                {/* Deducciones y Neto */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-1 text-rose-800">
                    Deducciones de Ley (Retenciones)
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Seguro Social Obligatorio (IVSS 4%):</span>
                      <span className="font-mono text-rose-700">{formatCurrency(salaryTotals.deduccionIVSS)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Régimen Prestacional de Empleo (0.5%):</span>
                      <span className="font-mono text-rose-700">{formatCurrency(salaryTotals.deduccionRPE)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Fondo Ahorro Vivienda (FAOV 1%):</span>
                      <span className="font-mono text-rose-700">{formatCurrency(salaryTotals.deduccionFAOV)}</span>
                    </div>
                    {salaryTotals.otrasDeducciones > 0 && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Otras Retenciones Institucionales:</span>
                        <span className="font-mono text-rose-700">{formatCurrency(salaryTotals.otrasDeducciones)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t-2 border-slate-300 font-bold text-xs">
                      <span className="text-slate-700">Total Deducciones:</span>
                      <span className="font-mono text-rose-700">{formatCurrency(salaryTotals.totalDeducciones)}</span>
                    </div>

                    {/* Neto Box */}
                    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-900 rounded-xl space-y-1">
                      <span className="text-[11px] font-bold uppercase text-blue-900 block">
                        Neto Total a Cobrar en el Mes:
                      </span>
                      <div className="text-2xl font-black font-mono text-blue-950">
                        {formatCurrency(salaryTotals.netoTotal)}
                      </div>
                      <div className="text-[11px] text-blue-800 pt-2 border-t border-blue-200/80 flex justify-between font-mono">
                        <span>Pago Estimado Q1: {formatCurrency(salaryTotals.netoQ1)}</span>
                        <span>Pago Estimado Q2: {formatCurrency(salaryTotals.netoQ2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <DocumentViewerModal
        document={viewingDoc}
        employeeName={`${employee.firstName} ${employee.lastName}`}
        onClose={() => setViewingDoc(null)}
      />

      {isVacationModalOpen && (
        <VacationModal
          employee={employee}
          onSave={handleSaveVacation}
          onClose={() => setIsVacationModalOpen(false)}
        />
      )}

      {isPermissionModalOpen && (
        <PermissionModal
          employee={employee}
          onSave={handleSavePermission}
          onClose={() => setIsPermissionModalOpen(false)}
        />
      )}

      {isMedicalLeaveModalOpen && (
        <MedicalLeaveModal
          employee={employee}
          onSave={handleSaveMedicalLeave}
          onClose={() => setIsMedicalLeaveModalOpen(false)}
        />
      )}

      {isPaySlipModalOpen && (
        <PrintPaySlipModal
          employee={employee}
          onClose={() => setIsPaySlipModalOpen(false)}
        />
      )}

      {isSeniorityModalOpen && (
        <SeniorityModal
          employee={employee}
          scale={scale}
          onSave={(updated) => {
            onUpdateEmployee(updated);
            setIsSeniorityModalOpen(false);
          }}
          onClose={() => setIsSeniorityModalOpen(false)}
        />
      )}

      {isScaleModalOpen && (
        <VacationScaleModal
          currentScale={scale}
          onSaveScale={(updatedScale) => {
            if (onSaveScale) onSaveScale(updatedScale);
            setIsScaleModalOpen(false);
          }}
          onClose={() => setIsScaleModalOpen(false)}
        />
      )}
    </div>
  );
};
