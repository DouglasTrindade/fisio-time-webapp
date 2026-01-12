export interface AttendanceSeriesPoint {
  date: string
  evaluations: number
  evolutions: number
  total: number
  averagePerPatient: number
}

export interface GenderDistributionEntry {
  label: string
  value: number
}

export interface AgeGenderBreakdownEntry {
  range: string
  masculino: number
  feminino: number
  outro: number
  naoInformado: number
}

export interface PatientAttendanceRow {
  id: string
  name: string
  age: number | null
  attendances: number
}

export interface PatientAttendanceSummary {
  totalPatients: number
  patientsRegisteredInPeriod: number
  attendedPatients: number
  totalAttendances: number
  evaluations: number
  evolutions: number
  averagePerDay: number
  averagePerPatient: number
  appointmentsInPeriod: number
}

export interface PatientAttendanceReport {
  timeframe: {
    start: string
    end: string
  }
  summary: PatientAttendanceSummary
  series: AttendanceSeriesPoint[]
  genderDistribution: GenderDistributionEntry[]
  ageGender: AgeGenderBreakdownEntry[]
  patients: PatientAttendanceRow[]
}

export interface ProfessionalPerformanceEntry {
  id: string
  name: string
  attendances: number
  evaluations: number
  evolutions: number
  averageDuration?: number | null
}

export interface ProfessionalsAttendanceSummary {
  totalAttendances: number
  averagePerDay: number
  activeProfessionals: number
  newProfessionals: number
  evaluations: number
  evolutions: number
  averageDuration: string | null
}

export interface ProfessionalsAttendanceReport {
  timeframe: {
    start: string
    end: string
  }
  summary: ProfessionalsAttendanceSummary
  professionals: ProfessionalPerformanceEntry[]
}

export interface CityAttendanceEntry {
  name: string
  state?: string | null
  attendances: number
}

export interface CityGrowthEntry {
  name: string
  percentage: number
}

export interface CitiesAttendanceSummary {
  totalAttendances: number
  visitedCities: number
  topCity: {
    name: string
    attendances: number
  } | null
  averagePerCity: number
  citiesWithGrowth: number
  coveragePercentage: number
}

export interface CitiesAttendanceReport {
  timeframe: {
    start: string
    end: string
  }
  summary: CitiesAttendanceSummary
  cities: CityAttendanceEntry[]
  growth: CityGrowthEntry[]
}
