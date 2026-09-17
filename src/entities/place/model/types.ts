// entities 레이어 : '장소' 도메인 개념, ERD places 테이블과 1:1 대응

export interface Place {
    id: number
    apiId: string
    name: string
    category: string
    address: string
    price: number | null
    latitude: number
    longitude: number
    imgUrl: string
    tel: string
    overview: string
}