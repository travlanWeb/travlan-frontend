import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../shared/api/axiosInstance'
//   axiosInstance는 baseURL(백엔드 주소)이 미리 설정된 axios 객체입니다.
//   매번 전체 URL을 안 쓰고 '/auth/signup'처럼 경로만 써도 되게 해주는 역할이에요.

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSendToLogin = () => {
    navigate('/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 여기가 빠져있던 부분입니다.
      // axios.post(요청 보낼 주소, 요청 본문)
      // 두 번째 인자로 넘긴 객체가 백엔드가 받는 요청 body가 됩니다.
      // 필드명(name, email, password)은 백엔드 DTO 필드명과
      // 정확히 일치해야 하니, BE 회원가입 API 스펙과 다르면 여기 이름을 맞춰주세요.
      await api.post('/auth/signup', {
        name,
        email,
        password,
      })

      // 요청이 성공(2xx 응답)했을 때만 이 아래 코드가 실행됩니다.
      // await는 "이 줄이 끝날 때까지 기다렸다가 다음 줄로 넘어가라"는 뜻이라,
      // 서버 응답이 오기 전에 미리 로그인 페이지로 넘어가는 일을 막아줍니다.
      navigate('/login')
    } catch (error) {
      // axios는 응답 상태 코드가 400, 500처럼 에러 범위면
      // 자동으로 이 catch 블록으로 옵니다. (로그인 400 에러 때와 같은 원리)
      setError('입력하신 정보를 다시 확인해주세요.')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pure-white">
      <div className="w-full max-w-sm border border-pebble p-8">
        <h1 className="text-2xl font-bold text-deep-ink mb-8 text-center">회원가입</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-pebble px-4 py-3 text-deep-ink"
          />
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-pebble px-4 py-3 text-deep-ink"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-pebble px-4 py-3 text-deep-ink"
          />
          <button
            type="submit"
            className="rounded-pill bg-deep-ink text-pure-white py-3 text-sm font-semibold mt-2"
          >
            회원가입
          </button>
        </form>

        <button
          onClick={handleSendToLogin}
          className="w-full text-center text-sm text-cool-ash mt-4"
        >
          이미 계정이 있으신가요? <span className="text-deep-ink font-semibold">로그인</span>
        </button>

        {error && (
          <p className="text-sm text-red-500 font-semibold mt-2 text-center">{error}</p>
        )}
      </div>
    </div>
  )
}