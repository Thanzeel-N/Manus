import Workspace from '../../components/workspace';
import './workspace.css';
import './brand-workspace.css';
import './workspace-modes.css';
import './permissions.css';
import '../login/login.css';

export const metadata = { title: 'Workspace · Manu’s Car World', robots: { index: false, follow: false } };
export default function DashboardPage() { return <Workspace />; }
