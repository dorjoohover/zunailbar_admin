// app/api/google/callback/route.ts
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response('Missing code', { status: 400 });

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/callback`
  );
  const { tokens } = await oauth2.getToken(code);
  // 👉 Demo: cookie-д тавьж байна (production-д DB-д хадгал!)
  (await cookies()).set('gc_tokens', JSON.stringify(tokens), { httpOnly: true, secure: false, path: '/' });
  return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/orders`);
}
