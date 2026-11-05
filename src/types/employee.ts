/**
 * Types for SIGERH - Sistema Integral de Recursos Humanos
 * Contraloría Municipal / Administración Pública
 */

export interface Child {
  id: string;
  fullName: string;
  idCard: string; // Cédula o 'Menor de edad'
  birthDate: string; // YYYY-MM-DD
  gender: 'M' | 'F';
  educationLevel: 'Inicial / Maternal' | 'Primaria' | 'Secundaria / Bachillerato' | 'Técnico Medio' | 'Universitario' | 'Otro';
  hasSpecialCondition: boolean;
  conditionNotes?: string;
}

export interface Spouse {
  fullName: string;
  idCard: string;
  birthDate: string;
  phone: string;
  occupation?: string;
  isLegallyMarried: boolean;
}

export interface DigitalDocument {
  id: string;
  type: 'curriculum' | 'gaceta' | 'cedula' | 'titulo' | 'otro';
  title: string;
  fileName: string;
  fileDataUrl?: string; // base64 or blob url
  fileType: string; // 'application/pdf', 'image/jpeg', 'image/png'
  uploadDate: string;
  gazetteNumber?: string; // e.g., 'Gaceta Municipal N° 1.482'
  gazetteDate?: string;
  resolutionNumber?: string; // e.g., 'Resolución N° CM-045-2022'
  notes?: string;
}

export interface TimeDuration {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  formatted: string;
}

export interface VacationScaleRule {
  id: string;
  minYears: number;
  maxYears: number;
  days: number;
  label: string;
  legalBasis?: string;
}

export interface VacationRecord {
  id: string;
  period: string; // e.g., "2024 - 2025"
  serviceYearsAtPeriod: number;
  correspondingDays: number; // 15, 20, 22, 30 days based on scale
  daysTaken: number;
  daysRemaining: number;
  startDate?: string;
  returnDate?: string;
  status: 'pendiente' | 'en_curso' | 'disfrutadas' | 'vencidas';
  resolutionNumber?: string;
  notes?: string;
}

export type PermissionType = 
  | 'remunerado' 
  | 'no_remunerado' 
  | 'diligencia_personal' 
  | 'duelo_familiar' 
  | 'matrimonio' 
  | 'estudio_capacitacion' 
  | 'comision_servicio'
  | 'cumpleanos';

export interface PermissionRecord {
  id: string;
  type: PermissionType;
  startDate: string;
  endDate: string;
  workingDays: number;
  reason: string;
  status: 'aprobado' | 'pendiente' | 'rechazado';
  approvedBy?: string;
  requestDate: string;
  documentUrl?: string;
  notes?: string;
}

export type MedicalLeaveType = 
  | 'ivss' 
  | 'clinica_hospital' 
  | 'maternidad_paternidad' 
  | 'accidente_laboral' 
  | 'aislamiento'
  | 'otro';

export interface MedicalLeaveRecord {
  id: string;
  type: MedicalLeaveType;
  diagnosis: string;
  healthCenter: string;
  doctorName: string;
  doctorLicense?: string;
  ivssValidationCode?: string; // Boleta o convalidación IVSS
  startDate: string;
  endDate: string;
  totalDays: number;
  status: 'activo' | 'finalizado' | 'convalidado_ivss' | 'pendiente_validacion';
  documentUrl?: string;
  notes?: string;
}

export interface SalaryStructure {
  quincena1: number; // Primera Quincena (15 de mes)
  quincena2: number; // Segunda Quincena (Fin de mes)
  cestaTicket: number; // Bono de Alimentación mensual (Cesta Ticket)
  bonoResponsabilidad: number; // Bono de Responsabilidad en el cargo
  bonoPuntualidad: number; // Bono de Puntualidad y Asistencia
  
  // Primas adicionales institucionales
  primaAntiguedad: number; // Por años en Adm. Pública
  primaProfesionalizacion: number; // Grado académico
  primaHijos: number; // Por carga familiar
  otrasAsignaciones: number; // Bono especial / guerra / compensatorio
  
  // Deducciones legales
  deduccionIVSS: number; // Seguro Social (4%)
  deduccionRPE: number; // Paro Forzoso / Empleo (0.5%)
  deduccionFAOV: number; // Política Habitacional (1%)
  otrasDeducciones: number; // Caja de ahorro, préstamo, etc.
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  idCard: string; // e.g. "V-18.492.304"
  nationality: 'V' | 'E';
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: 'M' | 'F';
  civilStatus: 'soltero' | 'soltera' | 'casado' | 'casada' | 'concubinato' | 'divorciado' | 'divorciada' | 'viudo' | 'viuda';
  photoUrl?: string;

  // Datos Institucionales
  jobTitle: string; // Cargo (ej. Auditor Fiscal II)
  department: string; // Unidad / Dirección (ej. Dirección de Control Posterior)
  employmentType: 'Fijo' | 'Contratado' | 'Alto Nivel' | 'Libre Nombramiento';
  status: 'activo' | 'vacaciones' | 'reposo' | 'permiso' | 'egresado';
  bankName?: string;
  bankAccount?: string;

  // Fechas Clave de Ingreso y Reconocimiento de Antigüedad
  publicAdminEntryDate: string; // Ingreso a la Administración Pública
  municipalAuditEntryDate: string; // Ingreso a la Contraloría Municipal
  seniorityType?: 'continuo' | 'discontinuo'; // Tipo de cómputo de servicio (continuo vs discontinuo/no continuo)
  isManualSeniority?: boolean; // Indica si los años/meses/días fueron fijados manualmente por servicios discontinuos
  manualPublicAdminYears?: number; // Años efectivos acumulados en Adm. Pública
  manualPublicAdminMonths?: number; // Meses efectivos acumulados en Adm. Pública
  manualPublicAdminDays?: number; // Días efectivos acumulados en Adm. Pública
  manualMunicipalAuditYears?: number; // Años efectivos en Contraloría Municipal
  manualMunicipalAuditMonths?: number; // Meses efectivos en Contraloría Municipal
  manualMunicipalAuditDays?: number; // Días efectivos en Contraloría Municipal
  discontinuousServiceNotes?: string; // Detalle de periodos no continuos en expediente
  recognizedPriorYears?: number; // Años previos reconocidos en otros entes públicos
  recognizedPriorMonths?: number; // Meses previos reconocidos
  recognizedPriorDays?: number; // Días previos reconocidos
  recognizedServiceResolution?: string; // N° de Resolución o Auto de Reconocimiento
  recognizedServiceEntity?: string; // Ente emisor (ej. Ministerio de Educación)
  recognizedServiceDate?: string; // Fecha de resolución de reconocimiento
  customSeniorityYears?: number; // Ajuste manual directo si aplica por resolución



  // Carga Familiar
  spouse?: Spouse;
  children: Child[];

  // Documentos digitales cargados
  documents: DigitalDocument[];
  curriculumDoc?: DigitalDocument;
  gacetaDoc?: DigitalDocument;

  // Control de Vacaciones
  vacations: VacationRecord[];

  // Permisos y Reposos
  permissions: PermissionRecord[];
  medicalLeaves: MedicalLeaveRecord[];

  // Estructura Salarial
  salary: SalaryStructure;

  // Metadatos
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VacationAlertInfo {
  employeeId: string;
  employeeName: string;
  idCard: string;
  yearsOfService: number;
  entitledDays: number;
  anniversaryDate: string;
  isDue: boolean;
  alertType: 'cumplido' | 'proximo_mes' | 'pendiente_disfrutar';
  message: string;
}
