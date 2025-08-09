// app/api/google/auth/route.ts
import { google } from 'googleapis';
export async function GET() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/callback`
  );
  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  });
  return Response.redirect(url);
}
