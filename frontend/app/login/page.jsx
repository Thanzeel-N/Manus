import UnifiedLogin from '../../components/unified-login';
import '../dashboard/workspace.css';
import '../dashboard/brand-workspace.css';
import '../dashboard/workspace-modes.css';
import './login.css';
export const metadata = { title: 'Sign in | Manu’s Car World', robots: { index: false, follow: false } };
export default function LoginPage() { return <UnifiedLogin/>; }
