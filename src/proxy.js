import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { hasPermission } from '@/lib/permissions';

const ROUTE_PERMISSIONS = {
  '/admin/slider': 'slider',
  '/admin/homepage-manager': 'homepage-manager',
  '/admin/products': 'products',
  '/admin/quote-requests': 'quote-requests',
  '/admin/categories': 'categories',
  '/admin/custom-fields': 'custom-fields',
  '/admin/contact-messages': 'contact-messages',
  '/admin/reviews': 'reviews',
  '/admin/comments': 'comments',
  '/admin/abuse-reports': 'abuse-reports',
  '/admin/tags': 'tags',
  '/admin/orders': 'orders',
  '/admin/payments': 'payments',
  '/admin/membership': 'membership',
  '/admin/settings': 'settings',
  '/admin/roles': 'roles-permissions',
};

export async function proxy(request) {
  const path = request.nextUrl.pathname;
  const { response, user, supabase } = await updateSession(request);

  if (!path.startsWith('/dashboard') && !path.startsWith('/admin')) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Cek role dari tabel profiles (bukan cookie mock lagi)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const userWithRole = { role: profile?.role || 'member' };

  if (path.startsWith('/dashboard')) {
    if (userWithRole.role === 'moderator') {
      const allowed = ['/dashboard/profile', '/dashboard/messages'];
      const isAllowed = allowed.some((p) => path.startsWith(p));
      if (!isAllowed) return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  if (path.startsWith('/admin')) {
    if (!hasPermission(userWithRole, 'admin-panel')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    for (const [route, perm] of Object.entries(ROUTE_PERMISSIONS)) {
      if (path.startsWith(route)) {
        if (!hasPermission(userWithRole, perm)) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        break;
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
