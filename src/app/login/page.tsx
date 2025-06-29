import LoginForm from '../../components/auth/LoginForm'
import ProxyDiagnostic from '../../components/ProxyDiagnostic'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] py-8 space-y-6">
      <LoginForm />
      <ProxyDiagnostic />
    </div>
  );
}