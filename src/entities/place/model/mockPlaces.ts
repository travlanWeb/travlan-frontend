import type { Place } from "./types";

export const mockPlaces: Place[] = [
     {
    id: 1,
    apiId: 'mock-001',
    name: '해운대 해수욕장',
    category: '자연',
    address: '부산 해운대구',
    price: null,
    latitude: 35.1587,
    longitude: 129.1604,
  },
  {
    id: 2,
    apiId: 'mock-002',
    name: '전주 한옥마을',
    category: '문화',
    address: '전북 전주시',
    price: 5000,
    latitude: 35.8154,
    longitude: 127.1531,
  },
  {
    id: 3,
    apiId: 'mock-003',
    name: '남산타워',
    category: '전망',
    address: '서울 용산구',
    price: 21000,
    latitude: 37.5512,
    longitude: 126.9882,
  },
]