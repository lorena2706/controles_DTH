import React, { useState, useRef } from 'react';
import { X, UserPlus, Save, Building, User, Calendar, DollarSign, FileText, Camera, Upload, Trash2, History, Clock } from 'lucide-react';
import { Employee, SalaryStructure } from '../types/employee';

interface EmployeeModalProps {
  initialEmployee?: Employee | null;
  onSave: (employee: Employee) => void;
  onClose: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  initialEmployee,
  onSave,
  onClose,
}) => {
  const isEditing = !!initialEmployee;
  const [activeStep, setActiveStep] = useState<'personal' | 'laboral' | 'conyuge' | 'salarial'>('personal');

  // Photo state
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialEmployee?.photoUrl);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Form State
  const [firstName, setFirstName] = useState(initialEmployee?.firstName || '');
  const [lastName, setLastName] = useState(initialEmployee?.lastName || '');
  const [nationality, setNationality] = useState<'V' | 'E'>(initialEmployee?.nationality || 'V');
  const [idCardNumber, setIdCardNumber] = useState(
    initialEmployee?.idCard ? initialEmployee.idCard.replace(/^[VE]-?/i, '') : ''
  );
  const [birthDate, setBirthDate] = useState(initialEmployee?.birthDate || '1990-01-15');
  const [gender, setGender] = useState<'M' | 'F'>(initialEmployee?.gender || 'F');
  const [civilStatus, setCivilStatus] = useState<Employee['civilStatus']>(initialEmployee?.civilStatus || 'soltero');
  const [phone, setPhone] = useState(initialEmployee?.phone || '0414-');
  const [email, setEmail] = useState(initialEmployee?.email || '');
  const [address, setAddress] = useState(initialEmployee?.address || '');

  // Laboral & Antigüedad
  const [jobTitle, setJobTitle] = useState(initialEmployee?.jobTitle || 'Auditor Fiscal');
  const [department, setDepartment] = useState(initialEmployee?.department || 'Dirección de Control Posterior');
  const [employmentType, setEmploymentType] = useState<Employee['employmentType']>(initialEmployee?.employmentType || 'Fijo');
  const [status, setStatus] = useState<Employee['status']>(initialEmployee?.status || 'activo');

  // Seniority mode: continuous vs discontinuous
  const [seniorityType, setSeniorityType] = useState<'continuo' | 'discontinuo'>(
    initialEmployee?.seniorityType === 'discontinuo' || !!initialEmployee?.isManualSeniority
      ? 'discontinuo'
      : 'continuo'
  );
  const [publicAdminEntryDate, setPublicAdminEntryDate] = useState(initialEmployee?.publicAdminEntryDate || '2020-01-15');
  const [municipalAuditEntryDate, setMunicipalAuditEntryDate] = useState(initialEmployee?.municipalAuditEntryDate || '2022-06-01');

  // Manual discontinuous seniority
  const [manualPublicAdminYears, setManualPublicAdminYears] = useState<number>(
    initialEmployee?.manualPublicAdminYears ?? (initialEmployee?.customSeniorityYears || 0)
  );
  const [manualPublicAdminMonths, setManualPublicAdminMonths] = useState<number>(
    initialEmployee?.manualPublicAdminMonths ?? 0
  );
  const [manualPublicAdminDays, setManualPublicAdminDays] = useState<number>(
    initialEmployee?.manualPublicAdminDays ?? 0
  );

  const [manualMunicipalAuditYears, setManualMunicipalAuditYears] = useState<number>(
    initialEmployee?.manualMunicipalAuditYears ?? 0
  );
  const [manualMunicipalAuditMonths, setManualMunicipalAuditMonths] = useState<number>(
    initialEmployee?.manualMunicipalAuditMonths ?? 0
  );
  const [manualMunicipalAuditDays, setManualMunicipalAuditDays] = useState<number>(
    initialEmployee?.manualMunicipalAuditDays ?? 0
  );
  const [discontinuousServiceNotes, setDiscontinuousServiceNotes] = useState<string>(
    initialEmployee?.discontinuousServiceNotes || ''
  );

  const [hasPriorService, setHasPriorService] = useState(
    !!(initialEmployee?.recognizedPriorYears || initialEmployee?.recognizedPriorMonths || initialEmployee?.recognizedPriorDays)
  );
  const [recognizedPriorYears, setRecognizedPriorYears] = useState(initialEmployee?.recognizedPriorYears || 0);
  const [recognizedPriorMonths, setRecognizedPriorMonths] = useState(initialEmployee?.recognizedPriorMonths || 0);
  const [recognizedPriorDays, setRecognizedPriorDays] = useState(initialEmployee?.recognizedPriorDays || 0);
  const [recognizedServiceEntity, setRecognizedServiceEntity] = useState(initialEmployee?.recognizedServiceEntity || '');
  const [recognizedServiceResolution, setRecognizedServiceResolution] = useState(initialEmployee?.recognizedServiceResolution || '');
  const [bankName, setBankName] = useState(initialEmployee?.bankName || 'Banco de Venezuela');
  const [bankAccount, setBankAccount] = useState(initialEmployee?.bankAccount || '0102-');

  // Spouse
  const [hasSpouse, setHasSpouse] = useState(!!initialEmployee?.spouse);
  const [spouseFullName, setSpouseFullName] = useState(initialEmployee?.spouse?.fullName || '');
  const [spouseIdCard, setSpouseIdCard] = useState(initialEmployee?.spouse?.idCard || 'V-');
  const [spouseBirthDate, setSpouseBirthDate] = useState(initialEmployee?.spouse?.birthDate || '1990-01-01');
  const [spousePhone, setSpousePhone] = useState(initialEmployee?.spouse?.phone || '');
  const [spouseOccupation, setSpouseOccupation] = useState(initialEmployee?.spouse?.occupation || '');

  // Salary
  const [salary, setSalary] = useState<SalaryStructure>(
    initialEmployee?.salary || {
      quincena1: 3000.0,
      quincena2: 3000.0,
      cestaTicket: 1440.0,
      bonoResponsabilidad: 1500.0,
      bonoPuntualidad: 700.0,
      primaAntiguedad: 400.0,
      primaProfesionalizacion: 600.0,
      primaHijos: 200.0,
      otrasAsignaciones: 300.0,
      deduccionIVSS: 240.0,
      deduccionRPE: 30.0,
      deduccionFAOV: 60.0,
      otrasDeducciones: 50.0,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !idCardNumber.trim()) {
      alert('Por favor complete los nombres, apellidos y número de cédula.');
      return;
    }

    const fullIdCard = `${nationality}-${idCardNumber.trim()}`;

    const employeeData: Employee = {
      id: initialEmployee?.id || `emp-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      idCard: fullIdCard,
      nationality,
      email: email.trim() || `${firstName.toLowerCase().replace(/\s+/g, '')}.${lastName.toLowerCase().replace(/\s+/g, '')}@contraloria.gob.ve`,
      phone: phone.trim(),
      address: address.trim(),
      birthDate,
      gender,
      civilStatus,
      photoUrl: photoUrl || initialEmployee?.photoUrl,
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      employmentType,
      status,
      bankName,
      bankAccount,
      seniorityType,
      isManualSeniority: seniorityType === 'discontinuo',
      publicAdminEntryDate,
      municipalAuditEntryDate,
      manualPublicAdminYears: seniorityType === 'discontinuo' ? Number(manualPublicAdminYears) || 0 : undefined,
      manualPublicAdminMonths: seniorityType === 'discontinuo' ? Number(manualPublicAdminMonths) || 0 : undefined,
      manualPublicAdminDays: seniorityType === 'discontinuo' ? Number(manualPublicAdminDays) || 0 : undefined,
      manualMunicipalAuditYears: seniorityType === 'discontinuo' ? Number(manualMunicipalAuditYears) || 0 : undefined,
      manualMunicipalAuditMonths: seniorityType === 'discontinuo' ? Number(manualMunicipalAuditMonths) || 0 : undefined,
      manualMunicipalAuditDays: seniorityType === 'discontinuo' ? Number(manualMunicipalAuditDays) || 0 : undefined,
      discontinuousServiceNotes: seniorityType === 'discontinuo' ? discontinuousServiceNotes.trim() : undefined,
      recognizedPriorYears: seniorityType === 'continuo' && hasPriorService ? Number(recognizedPriorYears) || 0 : undefined,
      recognizedPriorMonths: seniorityType === 'continuo' && hasPriorService ? Number(recognizedPriorMonths) || 0 : undefined,
      recognizedPriorDays: seniorityType === 'continuo' && hasPriorService ? Number(recognizedPriorDays) || 0 : undefined,
      recognizedServiceEntity: seniorityType === 'continuo' && hasPriorService && recognizedServiceEntity.trim() ? recognizedServiceEntity.trim() : undefined,
      recognizedServiceResolution: seniorityType === 'continuo' && hasPriorService && recognizedServiceResolution.trim() ? recognizedServiceResolution.trim() : undefined,
      spouse: hasSpouse && spouseFullName.trim() ? {
        fullName: spouseFullName.trim(),
        idCard: spouseIdCard.trim(),
        birthDate: spouseBirthDate,
        phone: spousePhone.trim(),
        occupation: spouseOccupation.trim(),
        isLegallyMarried: true,
      } : undefined,
      children: initialEmployee?.children || [],
      documents: initialEmployee?.documents || [
        {
          id: `doc-init-cv-${Date.now()}`,
          type: 'curriculum',
          title: `Currículum Vitae de ${firstName} ${lastName}`,
          fileName: `CV_${firstName}_${lastName}.pdf`,
          fileType: 'application/pdf',
          uploadDate: new Date().toISOString().split('T')[0],
          notes: 'Expediente digital inicial aperturado en el sistema.',
        },
      ],
      curriculumDoc: initialEmployee?.curriculumDoc || {
        id: `doc-init-cv-${Date.now()}`,
        type: 'curriculum',
        title: `Currículum Vitae de ${firstName} ${lastName}`,
        fileName: `CV_${firstName}_${lastName}.pdf`,
        fileType: 'application/pdf',
        uploadDate: new Date().toISOString().split('T')[0],
        notes: 'Expediente digital inicial aperturado en el sistema.',
      },
      gacetaDoc: initialEmployee?.gacetaDoc,
      vacations: initialEmployee?.vacations || [],
      permissions: initialEmployee?.permissions || [],
      medicalLeaves: initialEmployee?.medicalLeaves || [],
      salary,
      createdAt: initialEmployee?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(employeeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 border border-slate-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {isEditing ? 'Editar Ficha del Funcionario' : 'Registrar Nuevo Funcionario en Recursos Humanos'}
              </h3>
              <p className="text-xs text-slate-300">
                Contraloría Municipal · Control de Personal y Expedientes
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Steps */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100/60 px-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveStep('personal')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeStep === 'personal' ? 'border-blue-600 text-blue-900 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            1. Datos Personales
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('laboral')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeStep === 'laboral' ? 'border-blue-600 text-blue-900 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            2. Cargo y Fechas de Ingreso
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('conyuge')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeStep === 'conyuge' ? 'border-blue-600 text-blue-900 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            3. Cónyuge / Esposo(a)
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('salarial')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeStep === 'salarial' ? 'border-blue-600 text-blue-900 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            4. Asignaciones Salariales
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Step 1: Datos Personales */}
          {activeStep === 'personal' && (
            <div className="space-y-4">
              {/* Photo Upload Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Foto de Funcionario"
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-blue-600 shadow-xs"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-slate-200 text-slate-600 flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                      <Camera className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-[10px] font-semibold text-slate-500">Sin Foto</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="font-bold text-slate-900 text-xs">Fotografía del Funcionario (Ficha y Carnet)</div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Cargue una fotografía reciente tipo carnet o del perfil institucional del empleado.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      type="file"
                      ref={photoInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {photoUrl ? 'Cambiar Foto' : 'Cargar Foto'}
                    </button>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl(undefined)}
                        className="px-2.5 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nacionalidad y Cédula (*)</label>
                  <div className="flex gap-1.5">
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value as 'V' | 'E')}
                      className="px-2 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-slate-50"
                    >
                      <option value="V">V-</option>
                      <option value="E">E-</option>
                    </select>
                    <input
                      type="text"
                      value={idCardNumber}
                      onChange={(e) => setIdCardNumber(e.target.value)}
                      placeholder="18.492.304"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombres (*)</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Primer y segundo nombre"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Apellidos (*)</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Apellidos"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sexo / Género</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado Civil</label>
                  <select
                    value={civilStatus}
                    onChange={(e) => setCivilStatus(e.target.value as Employee['civilStatus'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="soltero">Soltero(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="concubinato">Concubinato / Unión Estable</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viudo">Viudo(a)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0414-1234567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="funcionario@contraloria.gob.ve"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección de Domicilio</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Avenida, Calle, Edificio/Casa, Sector, Ciudad"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Step 2: Cargo y Fechas de Ingreso */}
          {activeStep === 'laboral' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo / Puesto (*)</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Ej. Auditor Fiscal II, Director de Control"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dirección / Unidad / Departamento (*)</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Ej. Dirección de Control Posterior"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condición Laboral</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as Employee['employmentType'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Fijo">Empleado Fijo (Carrera Administrativa)</option>
                    <option value="Contratado">Contratado</option>
                    <option value="Alto Nivel">Alto Nivel</option>
                    <option value="Libre Nombramiento">Libre Nombramiento y Remoción</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado de la Ficha</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Employee['status'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="activo">Activo en funciones</option>
                    <option value="vacaciones">En Disfrute de Vacaciones</option>
                    <option value="reposo">En Reposo Médico</option>
                    <option value="permiso">Con Permiso Autorizado</option>
                    <option value="egresado">Egresado / Jubilado</option>
                  </select>
                </div>
              </div>

              {/* Crucial Dates & Seniority Calculation with Mode Switcher */}
              <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/80 pb-2">
                  <span className="font-bold text-blue-950 uppercase text-xs block">
                    Cómputo de Antigüedad y Años de Servicio
                  </span>
                  <div className="flex rounded-md bg-white p-0.5 border border-blue-300 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setSeniorityType('continuo')}
                      className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                        seniorityType === 'continuo'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Continuo (Por Fechas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSeniorityType('discontinuo')}
                      className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                        seniorityType === 'discontinuo'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      Discontinuo (Manual)
                    </button>
                  </div>
                </div>

                {seniorityType === 'continuo' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-blue-900 mb-1">
                          Fecha de Ingreso a la Administración Pública (*)
                        </label>
                        <input
                          type="date"
                          value={publicAdminEntryDate}
                          onChange={(e) => setPublicAdminEntryDate(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                        <p className="text-[10px] text-blue-700 mt-1">
                          Se utiliza para el conteo ininterrumpido de años, meses y días.
                        </p>
                      </div>

                      <div>
                        <label className="block font-semibold text-blue-900 mb-1">
                          Fecha de Ingreso a la Contraloría Municipal (*)
                        </label>
                        <input
                          type="date"
                          value={municipalAuditEntryDate}
                          onChange={(e) => setMunicipalAuditEntryDate(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                        <p className="text-[10px] text-blue-700 mt-1">
                          Conteo de permanencia institucional en el órgano de control municipal.
                        </p>
                      </div>
                    </div>

                    {/* Servicios Previos Reconocidos (Acreditación) */}
                    <div className="pt-2 border-t border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id="hasPriorServiceCheck"
                          checked={hasPriorService}
                          onChange={(e) => setHasPriorService(e.target.checked)}
                          className="rounded text-blue-600 w-4 h-4"
                        />
                        <label htmlFor="hasPriorServiceCheck" className="font-bold text-blue-950 text-xs">
                          ¿Posee Años / Servicios Anteriores Reconocidos en otros entes del Estado?
                        </label>
                      </div>

                      {hasPriorService && (
                        <div className="p-3 bg-white rounded-lg border border-blue-200 space-y-2 mt-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">Años Previos:</label>
                              <input
                                type="number"
                                min="0"
                                max="50"
                                value={recognizedPriorYears}
                                onChange={(e) => setRecognizedPriorYears(parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">Meses Previos:</label>
                              <input
                                type="number"
                                min="0"
                                max="11"
                                value={recognizedPriorMonths}
                                onChange={(e) => setRecognizedPriorMonths(parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">Días Previos:</label>
                              <input
                                type="number"
                                min="0"
                                max="29"
                                value={recognizedPriorDays}
                                onChange={(e) => setRecognizedPriorDays(parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">Ente Público de Procedencia:</label>
                              <input
                                type="text"
                                value={recognizedServiceEntity}
                                onChange={(e) => setRecognizedServiceEntity(e.target.value)}
                                placeholder="Ej. Ministerio de Finanzas, Alcaldía"
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">N° Resolución / Constancia:</label>
                              <input
                                type="text"
                                value={recognizedServiceResolution}
                                onChange={(e) => setRecognizedServiceResolution(e.target.value)}
                                placeholder="Ej. Resolución CM-RRHH-028"
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                    <div className="text-[11px] text-amber-900 font-medium">
                      Modo Manual para servicios no continuos, lapsos intermitentes en varios entes o certificados por constancia oficial.
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 text-xs block mb-1">
                        1. Tiempo Total Efectivo en Administración Pública (Cómputo Discontinuo):
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">Años:</label>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={manualPublicAdminYears}
                            onChange={(e) => setManualPublicAdminYears(parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-amber-300 bg-white rounded text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">Meses:</label>
                          <input
                            type="number"
                            min="0"
                            max="11"
                            value={manualPublicAdminMonths}
                            onChange={(e) => setManualPublicAdminMonths(parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-amber-300 bg-white rounded text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">Días:</label>
                          <input
                            type="number"
                            min="0"
                            max="29"
                            value={manualPublicAdminDays}
                            onChange={(e) => setManualPublicAdminDays(parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-amber-300 bg-white rounded text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 text-xs block mb-1">
                        2. Tiempo Efectivo en Contraloría Municipal:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">Años Contraloría:</label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={manualMunicipalAuditYears}
                            onChange={(e) => setManualMunicipalAuditYears(parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-slate-300 bg-white rounded text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">Meses Contraloría:</label>
                          <input
                            type="number"
                            min="0"
                            max="11"
                            value={manualMunicipalAuditMonths}
                            onChange={(e) => setManualMunicipalAuditMonths(parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-slate-300 bg-white rounded text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">Días Contraloría:</label>
                          <input
                            type="number"
                            min="0"
                            max="29"
                            value={manualMunicipalAuditDays}
                            onChange={(e) => setManualMunicipalAuditDays(parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-slate-300 bg-white rounded text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 text-[11px] mb-0.5">
                        Detalle / Historial de los Periodos No Continuos:
                      </label>
                      <textarea
                        rows={2}
                        value={discontinuousServiceNotes}
                        onChange={(e) => setDiscontinuousServiceNotes(e.target.value)}
                        placeholder="Ej. 2012-2015 en Ministerio de Educación; 2018-2021 en Alcaldía; 2023-presente en Contraloría..."
                        className="w-full px-2 py-1.5 border border-amber-300 bg-white rounded text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Banco Receptor de Nómina</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Banco de Venezuela, Bicentenario, etc."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número de Cuenta Nómina (20 dígitos)</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="0102-XXXX-XX-XXXXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Cónyuge */}
          {activeStep === 'conyuge' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  id="hasSpouseCheck"
                  checked={hasSpouse}
                  onChange={(e) => setHasSpouse(e.target.checked)}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <label htmlFor="hasSpouseCheck" className="font-semibold text-purple-950 text-xs">
                  ¿El funcionario tiene cónyuge o esposo(a)?
                </label>
              </div>

              {hasSpouse ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre Completo del Cónyuge:</label>
                    <input
                      type="text"
                      value={spouseFullName}
                      onChange={(e) => setSpouseFullName(e.target.value)}
                      placeholder="Nombres y Apellidos"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Cédula del Cónyuge:</label>
                      <input
                        type="text"
                        value={spouseIdCard}
                        onChange={(e) => setSpouseIdCard(e.target.value)}
                        placeholder="V-14.500.000"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Teléfono:</label>
                      <input
                        type="text"
                        value={spousePhone}
                        onChange={(e) => setSpousePhone(e.target.value)}
                        placeholder="0414-XXXXXXX"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Fecha de Nacimiento:</label>
                      <input
                        type="date"
                        value={spouseBirthDate}
                        onChange={(e) => setSpouseBirthDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Ocupación / Profesión:</label>
                      <input
                        type="text"
                        value={spouseOccupation}
                        onChange={(e) => setSpouseOccupation(e.target.value)}
                        placeholder="Ej. Docente, Ingeniero, etc."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Sin cónyuge registrado. Puede agregar los datos más adelante desde la ficha individual.
                </div>
              )}
            </div>
          )}

          {/* Step 4: Asignaciones Salariales */}
          {activeStep === 'salarial' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs">
                Configure las asignaciones quincenales y bonos solicitados (Quincenas 1 y 2, Cesta Ticket, Bono de Responsabilidad, Bono de Puntualidad).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quincena 1 (Día 15) Bs.:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salary.quincena1}
                    onChange={(e) => setSalary({ ...salary, quincena1: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quincena 2 (Fin de mes) Bs.:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salary.quincena2}
                    onChange={(e) => setSalary({ ...salary, quincena2: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cesta Ticket (Alimentación) Bs.:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salary.cestaTicket}
                    onChange={(e) => setSalary({ ...salary, cestaTicket: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bono de Responsabilidad Bs.:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salary.bonoResponsabilidad}
                    onChange={(e) => setSalary({ ...salary, bonoResponsabilidad: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bono de Puntualidad Bs.:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salary.bonoPuntualidad}
                    onChange={(e) => setSalary({ ...salary, bonoPuntualidad: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-purple-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prima Antigüedad Bs.:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salary.primaAntiguedad}
                    onChange={(e) => setSalary({ ...salary, primaAntiguedad: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prima Profesionalización Bs.:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salary.primaProfesionalizacion}
                    onChange={(e) => setSalary({ ...salary, primaProfesionalizacion: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prima por Hijos Bs.:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salary.primaHijos}
                    onChange={(e) => setSalary({ ...salary, primaHijos: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Bottom Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex gap-2">
              {activeStep !== 'personal' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 'laboral') setActiveStep('personal');
                    else if (activeStep === 'conyuge') setActiveStep('laboral');
                    else if (activeStep === 'salarial') setActiveStep('conyuge');
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-xs font-medium"
                >
                  Paso Anterior
                </button>
              )}
              {activeStep !== 'salarial' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 'personal') setActiveStep('laboral');
                    else if (activeStep === 'laboral') setActiveStep('conyuge');
                    else if (activeStep === 'conyuge') setActiveStep('salarial');
                  }}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium"
                >
                  Siguiente Paso
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                {isEditing ? 'Guardar Cambios' : 'Registrar Funcionario'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
