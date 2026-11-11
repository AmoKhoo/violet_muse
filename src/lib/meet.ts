// Violet Meet links — PLACEHOLDER until Google credentials are set.
//
// PLACEHOLDER, stated honestly: until GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET /
// GOOGLE_REFRESH_TOKEN are set, a booking gets a generated meet.google.com
// link that is NOT a real Google Meet event. The link is stored on the booking
// so the UI, notifications and calendar display all work end to end.
import crypto from 'node:crypto';

export function createMeetLink({ title, startsAt, endsAt }: { title: string; startsAt: string; endsAt: string }) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
    const code = crypto.randomBytes(5).toString('hex').slice(0, 10).replace(/(.{3})(.{4})(.{3})/, '$1-$2-$3');
    return {
      url: `https://meet.google.com/${code}`,
      status: 'placeholder' as const,
      note: 'PLACEHOLDER Meet link — not a real Google Meet event. Set Google credentials for real Meet links.',
      title, starts_at: startsAt, ends_at: endsAt,
    };
  }
  // --- REAL GOOGLE PATH (requires Google credentials) ---
  // TODO: use googleapis with the refresh token; create a Calendar event with
  // conferenceData { createRequest: { requestId } } and return event.hangoutLink.
  throw new Error('google_meet_not_wired: Google credentials are set but Meet creation is not implemented yet — see src/lib/meet.ts');
}
