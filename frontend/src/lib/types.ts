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
  department: string | null
  value_band: string | null
  archetype: string | null
  readiness: number | null
  impact_nc: number | null
  impact_aug: number | null
  impact_tf: number | null
  impact_rd: number | null
  metrics: string[]
  sources: Source[]
  generated_at: string
  reviewed: boolean
  reviewed_at: string | null
}
