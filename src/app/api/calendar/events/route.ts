// app/api/calendar/events/route.ts
import { google } from "googleapis";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json(); // { summary, startISO, endISO, calendarId?, description?, colorId? }
  const tok = (await cookies()).get("gc_tokens")?.value;
  if (!tok) return new Response("Not connected", { status: 401 });

  const tokens = JSON.parse(tok);
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/callback`
  );
  oauth2.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: oauth2 });
  const res = await calendar.events.insert({
    calendarId: body.calendarId || "primary",
    requestBody: {
      summary: body.summary,
      description: body.description ?? "",
      start: { dateTime: body.startISO },
      end: { dateTime: body.endISO },
      colorId: body.colorId ?? "5",
      extendedProperties: { private: body.meta ?? {} },
    },
  });
  return Response.json(res.data);
}
