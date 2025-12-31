import { PaginateResponse } from '../Paginate'

export interface DisposalMethod {
  id: number
  title: string
}

export interface DisposalMethodResponse extends PaginateResponse {
  data: DisposalMethod[]
}
