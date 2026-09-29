import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function assertSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  return { supabaseUrl, supabaseAnonKey };
}

export async function proxy(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = assertSupabaseConfig();
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  if (pathname === '/' && session) {
    return NextResponse.redirect(new URL('/portal/', request.url));
  }

  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/portal/', request.url));
  }

  if (pathname.startsWith('/portal') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/', '/login', '/portal/:path*'],
};