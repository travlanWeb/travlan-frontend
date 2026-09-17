import { useState, useEffect } from 'react'
import { api } from '../../shared/api/axiosInstance'
import { useDispatch } from 'react-redux'
import { login } from '../../entities/auth/model/authSlice'
import { useNavigate } from 'react-router-dom'


export default function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')  // 성공 시 이동 + 실패 시 에러 메시지 발생 useState
  const dispatch = useDispatch() // 인자 없이 받아옴



  // 회원가입 유도
  const navigate = useNavigate()
  const handleSendToSignup = () => { // 회원가입 페이지로 이동하는 함수 정의
    navigate('/signup')
  }

  // 구글 로그인

  const handleGoogleLogin = async (response: { credential: string }) => {
    try {
      const result = await api.post('/auth/google', { idToken: response.credential })
      dispatch(login(result.data))
      navigate('/')
    } catch (error) {
      setError('구글 로그인에 실패했습니다')
      console.error(error)
    }
  }

  useEffect(() => {
    // 구글 스크립트가 완전히 로드될 때까지 100ms마다 확인
    const initializeGoogleLogin = () => {
      // accounts.id.initialize까지 실제로 함수인지 확인
      if (
        !(window as any).google ||
        !(window as any).google.accounts ||
        typeof (window as any).google.accounts.id.initialize !== 'function'
      ) {
        // 아직 준비 안 됐으면 100ms 후 다시 시도
        setTimeout(initializeGoogleLogin, 100)
        return
      }

      ; (window as any).google.accounts.id.initialize({
        client_id: '379457475339-khb515cau5vvbno7bkhna803lhv9e22i.apps.googleusercontent.com',
        callback: handleGoogleLogin,
      })

        ; (window as any).google.accounts.id.renderButton(
          document.getElementById('google-login-button'),
          { type: 'standard' }
        )
    }

    initializeGoogleLogin()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await api.post('/auth/login', { email, password }) // swagger 바탕으로 수정해야 함
      dispatch(login(response.data)) // dispatch 함수 위에서 정의 후 response.data 를 login에 넘겨줌, redux devtools 사용하여 결과 편리하게 확인 가ㄴ,ㅇ
      navigate('/') // 로그인 성공하면 홈으로 보내기
    } catch (error) {
      setError('이메일 또는 비밀번호를 확인해주세요.')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pure-white">
      <div className="w-full max-w-sm border border-pebble p-8">
        <h1 className="text-2xl font-bold text-deep-ink mb-8 text-center">로그인</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <button type="submit"
            className="rounded-pill bg-deep-ink text-pure-white py-3 text-sm font-semibold mt-2">
            로그인
          </button>
        </form>

        <div id="google-login-button" className="mt-4"></div>

        <button
          onClick={handleSendToSignup}
          className="w-full text-center text-sm text-cool-ash mt-4"
        >
          계정이 없으신가요? <span className="text-deep-ink font-semibold">회원가입</span>
        </button>

        {error && (
          <p className="text-sm text-red-500 font-semibold mt-2 text-center">{error}</p>
        )}
      </div>
    </div>
  )
}