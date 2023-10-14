export interface ItemList {
  isTakeaway: boolean
  latitude: string | number
  longitude: string | number
  orderBy: number
  page: number
  regionId: number
  size: number
}

export interface IndexApi {
  login: (params: ItemList) => Promise<any>
}
