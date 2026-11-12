import { userFromRequest } from './auth';
export async function requireAdmin(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return { error: 'login_required', status: 401 };
  if (user.role !== 'admin') return { error: 'forbidden', status: 403 };
  return { user };
}
