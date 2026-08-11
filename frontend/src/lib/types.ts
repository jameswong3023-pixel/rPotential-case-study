export type Source = {
  label: string
  url: string | null
}

export type UoP = {
  id: string
  uop_num: number
  section: string
  name: string
  desc: string
  back_desc: string | null
  role: string | null
  // Raw pipeline label; use department_norm for filtering/grouping.
  department: string | null
  department_norm: string | null
  value_band: string | null
  // Parsed from value_band, in $M. Null when no dollar band exists.
  value_low: number | null
  value_high: number | null
  archetype: string | null
  readiness: number | null
  impact_nc: number | null
  impact_aug: number | null
  impact_tf: number | null
  impact_rd: number | null
  metrics: string[]
  sources: Source[]
  // Data-quality caveats detected at seed time, ready to display.
  data_flags: string[]
  generated_at: string
  reviewed: boolean
  reviewed_at: string | null
  shortlisted: boolean
}
