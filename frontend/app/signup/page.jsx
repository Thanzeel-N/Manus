import UnifiedLogin from '../../components/unified-login';
import '../dashboard/workspace.css';
import '../dashboard/brand-workspace.css';
import '../dashboard/workspace-modes.css';
import '../login/login.css';
export const metadata = { title: 'Create account | Manu\u2019s Car World', robots: { index: false, follow: false } };
export default function SignupPage() { return <UnifiedLogin createAccount={true} />; }
