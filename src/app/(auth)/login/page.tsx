import { login } from '../actions'
import LoginClient from './components/LoginClient'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await props.searchParams

  return (
    <LoginClient error={error} loginAction={login} />
  )
}
