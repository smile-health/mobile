export interface VaccineType {
  id: number
  title: string
  methods: VaccineMethod[]
}

export interface VaccineMethod {
  id: number
  title: string
  is_multi_patient: boolean
  sequences: VaccineSequence[]
}

export interface VaccineSequence {
  id: number
  title: string
  min: number
  max: number
}
