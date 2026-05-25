import { signup } from '../actions'
import SignupClient from './components/SignupClient'

export default async function SignupPage(props: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await props.searchParams

  return <SignupClient error={error} signupAction={signup} />
}
