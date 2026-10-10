import { customerProxy } from '../../../../lib/customer-proxy';
export async function GET(request, { params }) {
  const { action } = await params;
  return action === 'session' ? customerProxy(request, 'customer/session') : new Response(null, { status: 404 });
}
export async function POST(request, { params }) {
  const { action } = await params;
  return ['google', 'logout', 'password', 'register', 'registration-code', 'account-logout'].includes(action) ? customerProxy(request, `customer/${action}`) : new Response(null, { status: 404 });
}
