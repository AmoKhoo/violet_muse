import { userFromRequest } from './auth';
export function requireAdmin(req: Request) {
  const user = userFromRequest(req);
  if (!user) return { error: 'login_required', status: 401 };
  if (user.role !== 'admin') return { error: 'forbidden', status: 403 };
  return { user };
}
