/**
 * HR and Public Administration Calculations
 * Vacation scale rules, service duration counters, seniority management, salary math
 */

import { TimeDuration, VacationScaleRule, VacationAlertInfo, Employee, SalaryStructure } from '../types/employee';

/**
 * Default Vacation Scale as mandated by institutional regulations:
 * - 1 a 5 años: 15 días hábiles
 * - 6 a 11 años: 20 días hábiles
 * - 12 a 16 años: 22 días hábiles
 * - 17 a 25 años: 30 días hábiles
 * - Más de 25 años: 30 días hábiles
 */
export const DEFAULT_VACATION_SCALE_RULES: VacationScaleRule[] = [
  { id: 'scale-1', minYears: 1, maxYears: 5, days: 15, label: '1 a 5 años: 15 días', legalBasis: 'Art. 40 Ley del Estatuto de la Función Pública' },
  { id: 'scale-2', minYears: 6, maxYears: 11, days: 20, label: '6 a 11 años: 20 días', legalBasis: 'Art. 40 Ley del Estatuto de la Función Pública' },
  { id: 'scale-3', minYears: 12, maxYears: 16, days: 22, label: '12 a 16 años: 22 días', legalBasis: 'Convención Colectiva y Estatuto Institucional' },
  { id: 'scale-4', minYears: 17, maxYears: 25, days: 30, label: '17 a 25 años: 30 días', legalBasis: 'Escala Máxima de Control Fiscal Municipal' },
  { id: 'scale-5', minYears: 26, maxYears: 100, days: 30, label: 'Más de 25 años: 30 días', legalBasis: 'Tope Reglamentario de Antigüedad' },
];

export const VACATION_SCALE_RULES = DEFAULT_VACATION_SCALE_RULES;

/**
 * Returns vacation days entitled for a given number of completed years of service,
 * supporting a dynamic custom scale registered by the user.
 */
export function getVacationDaysByYears(years: number, scale: VacationScaleRule[] = DEFAULT_VACATION_SCALE_RULES): number {
  if (years < 1) return 0;

  // Search in user-defined or default scale
  const matchedRule = scale.find((rule) => years >= rule.minYears && years <= rule.maxYears);
  if (matchedRule) {
    return matchedRule.days;
  }

  // Fallback if higher than maximum bracket
  const maxBracket = [...scale].sort((a, b) => b.maxYears - a.maxYears)[0];
  if (maxBracket && years > maxBracket.maxYears) {
    return maxBracket.days;
  }

  return 15; // default fallback
}

export function getVacationRuleDescription(years: number, scale: VacationScaleRule[] = DEFAULT_VACATION_SCALE_RULES): string {
  if (years < 1) return 'Menor a 1 año (Acumulando periodo)';
  const matchedRule = scale.find((rule) => years >= rule.minYears && years <= rule.maxYears);
  if (matchedRule) {
    return `${matchedRule.label} (${matchedRule.days} días)`;
  }
  return `Escala ${years} años de servicio`;
}

/**
 * Calculate precise years, months, and days elapsed between two dates
 */
export function calculateExactDuration(startDateStr: string, endDateStr?: string): TimeDuration {
  if (!startDateStr) {
    return { years: 0, months: 0, days: 0, totalDays: 0, formatted: 'Sin fecha registrada' };
  }

  const start = new Date(startDateStr + 'T00:00:00');
  const end = endDateStr ? new Date(endDateStr + 'T00:00:00') : new Date();

  if (isNaN(start.getTime()) || start > end) {
    return { years: 0, months: 0, days: 0, totalDays: 0, formatted: '0 días' };
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    // Days in previous month of end date
    const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);

  return {
    years,
    months,
    days,
    totalDays,
    formatted: parts.join(', '),
  };
}

/**
 * Calculates the Total Seniority of an Employee, consolidating:
 * 1. Base time from publicAdminEntryDate
 * 2. Plus recognized prior service years, months, and days from certificates/resolutions
 * 3. Or direct manual seniority override if specified
 */
export function calculateTotalSeniority(employee: Employee): {
  baseDuration: TimeDuration;
  priorYears: number;
  priorMonths: number;
  priorDays: number;
  totalYears: number;
  totalMonths: number;
  totalDays: number;
  formattedTotal: string;
  hasRecognizedPrior: boolean;
  isDiscontinuous: boolean;
  resolutionInfo?: string;
  discontinuousNotes?: string;
} {
  const baseDuration = calculateExactDuration(employee.publicAdminEntryDate);

  // If employee has manual/discontinuous seniority registered
  if (employee.isManualSeniority || employee.seniorityType === 'discontinuo') {
    const mYears = Number(employee.manualPublicAdminYears) || 0;
    const mMonths = Number(employee.manualPublicAdminMonths) || 0;
    const mDays = Number(employee.manualPublicAdminDays) || 0;

    const parts: string[] = [];
    if (mYears > 0) parts.push(`${mYears} ${mYears === 1 ? 'año' : 'años'}`);
    if (mMonths > 0) parts.push(`${mMonths} ${mMonths === 1 ? 'mes' : 'meses'}`);
    if (mDays > 0 || parts.length === 0) parts.push(`${mDays} ${mDays === 1 ? 'día' : 'días'}`);

    return {
      baseDuration,
      priorYears: 0,
      priorMonths: 0,
      priorDays: 0,
      totalYears: mYears,
      totalMonths: mMonths,
      totalDays: mDays,
      formattedTotal: `${parts.join(', ')} (Servicios Discontinuos)`,
      hasRecognizedPrior: true,
      isDiscontinuous: true,
      resolutionInfo: employee.recognizedServiceResolution,
      discontinuousNotes: employee.discontinuousServiceNotes,
    };
  }

  // If manual custom seniority years is set directly
  if (employee.customSeniorityYears !== undefined && employee.customSeniorityYears !== null && employee.customSeniorityYears > 0) {
    return {
      baseDuration,
      priorYears: Math.max(0, employee.customSeniorityYears - baseDuration.years),
      priorMonths: 0,
      priorDays: 0,
      totalYears: employee.customSeniorityYears,
      totalMonths: baseDuration.months,
      totalDays: baseDuration.days,
      formattedTotal: `${employee.customSeniorityYears} años, ${baseDuration.months} meses y ${baseDuration.days} días (Ajuste Registrado)`,
      hasRecognizedPrior: true,
      isDiscontinuous: false,
      resolutionInfo: employee.recognizedServiceResolution,
    };
  }

  const priorYears = Number(employee.recognizedPriorYears) || 0;
  const priorMonths = Number(employee.recognizedPriorMonths) || 0;
  const priorDays = Number(employee.recognizedPriorDays) || 0;

  let totalDays = baseDuration.days + priorDays;
  let totalMonths = baseDuration.months + priorMonths;
  let totalYears = baseDuration.years + priorYears;

  if (totalDays >= 30) {
    totalMonths += Math.floor(totalDays / 30);
    totalDays = totalDays % 30;
  }

  if (totalMonths >= 12) {
    totalYears += Math.floor(totalMonths / 12);
    totalMonths = totalMonths % 12;
  }

  const parts: string[] = [];
  if (totalYears > 0) parts.push(`${totalYears} ${totalYears === 1 ? 'año' : 'años'}`);
  if (totalMonths > 0) parts.push(`${totalMonths} ${totalMonths === 1 ? 'mes' : 'meses'}`);
  if (totalDays > 0 || parts.length === 0) parts.push(`${totalDays} ${totalDays === 1 ? 'día' : 'días'}`);

  const hasRecognizedPrior = priorYears > 0 || priorMonths > 0 || priorDays > 0;

  return {
    baseDuration,
    priorYears,
    priorMonths,
    priorDays,
    totalYears,
    totalMonths,
    totalDays,
    formattedTotal: parts.join(', '),
    hasRecognizedPrior,
    isDiscontinuous: false,
    resolutionInfo: employee.recognizedServiceResolution,
  };
}

/**
 * Calculates Municipal Comptroller specific duration, taking into account manual discontinuous input if set
 */
export function calculateMunicipalSeniority(employee: Employee): TimeDuration {
  if (
    (employee.isManualSeniority || employee.seniorityType === 'discontinuo') &&
    employee.manualMunicipalAuditYears !== undefined &&
    employee.manualMunicipalAuditYears !== null
  ) {
    const y = Number(employee.manualMunicipalAuditYears) || 0;
    const m = Number(employee.manualMunicipalAuditMonths) || 0;
    const d = Number(employee.manualMunicipalAuditDays) || 0;

    const parts: string[] = [];
    if (y > 0) parts.push(`${y} ${y === 1 ? 'año' : 'años'}`);
    if (m > 0) parts.push(`${m} ${m === 1 ? 'mes' : 'meses'}`);
    if (d > 0 || parts.length === 0) parts.push(`${d} ${d === 1 ? 'día' : 'días'}`);

    return {
      years: y,
      months: m,
      days: d,
      totalDays: y * 365 + m * 30 + d,
      formatted: `${parts.join(', ')} (Discontinuo)`,
    };
  }

  return calculateExactDuration(employee.municipalAuditEntryDate);
}

/**
 * Calculates current age from birthdate
 */
export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr + 'T00:00:00');
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Checks if the employee has reached their 1-year anniversary (or multiples)
 * and verifies vacation entitlement alert, taking into account recognized seniority
 * and dynamic vacation scale.
 */
export function checkVacationAlert(
  employee: Employee,
  scale: VacationScaleRule[] = DEFAULT_VACATION_SCALE_RULES
): VacationAlertInfo | null {
  const entryDateStr = employee.municipalAuditEntryDate || employee.publicAdminEntryDate;
  if (!entryDateStr) return null;

  const entry = new Date(entryDateStr + 'T00:00:00');
  const today = new Date();
  const totalSeniority = calculateTotalSeniority(employee);
  const years = totalSeniority.totalYears;

  if (years < 1) {
    // Check if within next 30 days they will complete their 1st year
    const nextAnniversary = new Date(today.getFullYear(), entry.getMonth(), entry.getDate());
    if (nextAnniversary < today) {
      nextAnniversary.setFullYear(today.getFullYear() + 1);
    }
    const daysUntil = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 30 && totalSeniority.totalMonths === 11) {
      const entitledDays = getVacationDaysByYears(1, scale);
      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        idCard: employee.idCard,
        yearsOfService: 1,
        entitledDays,
        anniversaryDate: nextAnniversary.toISOString().split('T')[0],
        isDue: false,
        alertType: 'proximo_mes',
        message: `Próximo a cumplir su 1er año de servicio en ${daysUntil} días. Le corresponderán ${entitledDays} días de vacaciones según la escala.`,
      };
    }
    return null;
  }

  // Employee has 1 or more years.
  const entitledDays = getVacationDaysByYears(years, scale);

  // Check anniversary in this current month
  const thisYearAnniversary = new Date(today.getFullYear(), entry.getMonth(), entry.getDate());
  const isAnniversaryMonth = today.getMonth() === entry.getMonth();

  // Has employee enjoyed current period?
  const activeVacation = employee.vacations.some((v) => v.status === 'en_curso');

  if (activeVacation) {
    return null; // Already enjoying
  }

  if (years >= 1) {
    return {
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      idCard: employee.idCard,
      yearsOfService: years,
      entitledDays,
      anniversaryDate: thisYearAnniversary.toISOString().split('T')[0],
      isDue: true,
      alertType: isAnniversaryMonth ? 'cumplido' : 'pendiente_disfrutar',
      message: isAnniversaryMonth
        ? `¡Cumple ${years} ${years === 1 ? 'año' : 'años'} de servicio este mes! Le corresponden ${entitledDays} días de vacaciones reglamentarias.`
        : `Cuenta con ${years} años de servicio (${entitledDays} días correspondientes según la escala registrada).`,
    };
  }

  return null;
}

/**
 * Calculates all totals from the Salary structure
 */
export function calculateSalaryTotals(salary: SalaryStructure) {
  const q1 = Number(salary.quincena1) || 0;
  const q2 = Number(salary.quincena2) || 0;
  const totalQuincenas = q1 + q2;

  const cestaTicket = Number(salary.cestaTicket) || 0;
  const bonoResponsabilidad = Number(salary.bonoResponsabilidad) || 0;
  const bonoPuntualidad = Number(salary.bonoPuntualidad) || 0;
  const totalBonos = cestaTicket + bonoResponsabilidad + bonoPuntualidad;

  const primaAntiguedad = Number(salary.primaAntiguedad) || 0;
  const primaProfesionalizacion = Number(salary.primaProfesionalizacion) || 0;
  const primaHijos = Number(salary.primaHijos) || 0;
  const otrasAsignaciones = Number(salary.otrasAsignaciones) || 0;
  const totalPrimas = primaAntiguedad + primaProfesionalizacion + primaHijos + otrasAsignaciones;

  const totalAsignaciones = totalQuincenas + totalBonos + totalPrimas;

  const deduccionIVSS = Number(salary.deduccionIVSS) || 0;
  const deduccionRPE = Number(salary.deduccionRPE) || 0;
  const deduccionFAOV = Number(salary.deduccionFAOV) || 0;
  const otrasDeducciones = Number(salary.otrasDeducciones) || 0;
  const totalDeducciones = deduccionIVSS + deduccionRPE + deduccionFAOV + otrasDeducciones;

  const netoTotal = Math.max(0, totalAsignaciones - totalDeducciones);

  // Quincenal net estimate
  const asignacionQ1 = q1 + (bonoResponsabilidad / 2) + (bonoPuntualidad / 2) + (primaAntiguedad / 2) + (primaProfesionalizacion / 2) + (primaHijos / 2);
  const deduccionQ1 = (deduccionIVSS / 2) + (deduccionRPE / 2) + (deduccionFAOV / 2);
  const netoQ1 = Math.max(0, asignacionQ1 - deduccionQ1);

  const asignacionQ2 = q2 + (cestaTicket) + (bonoResponsabilidad / 2) + (bonoPuntualidad / 2) + (primaAntiguedad / 2) + (primaProfesionalizacion / 2) + (primaHijos / 2) + otrasAsignaciones;
  const deduccionQ2 = (deduccionIVSS / 2) + (deduccionRPE / 2) + (deduccionFAOV / 2) + otrasDeducciones;
  const netoQ2 = Math.max(0, asignacionQ2 - deduccionQ2);

  return {
    q1,
    q2,
    totalQuincenas,
    cestaTicket,
    bonoResponsabilidad,
    bonoPuntualidad,
    totalBonos,
    primaAntiguedad,
    primaProfesionalizacion,
    primaHijos,
    otrasAsignaciones,
    totalPrimas,
    totalAsignaciones,
    deduccionIVSS,
    deduccionRPE,
    deduccionFAOV,
    otrasDeducciones,
    totalDeducciones,
    netoTotal,
    netoQ1,
    netoQ2,
  };
}

/**
 * Format currency with Venezuelan standard (Bs. or $)
 */
export function formatCurrency(amount: number, currency: 'Bs.' | '$' = 'Bs.'): string {
  const formatted = new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return `${currency} ${formatted}`;
}

/**
 * Format a standard date string YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDateES(dateStr?: string): string {
  if (!dateStr) return 'No registrado';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
