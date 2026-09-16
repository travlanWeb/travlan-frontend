// jwt-decode 사용
// userId 반환하는 함수 작성

import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    sub: string // userId가 문자열로 들어있음
    email: string
    iat: number // Issued At : 토큰 발급 시각
    exp: number // Expiration : 토큰 만료 시각
}

export function getUserIdFromToken(accessToken: string): number {
    const decoded = jwtDecode<DecodedToken>(accessToken)

    return Number(decoded.sub)
}