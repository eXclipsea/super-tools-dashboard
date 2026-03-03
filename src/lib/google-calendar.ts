// Google Calendar API helpers
// Uses the access token from Supabase Google OAuth

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  status: string;
}

// Fetch today's events from Google Calendar
export async function getTodaysEvents(accessToken: string): Promise<CalendarEvent[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const params = new URLSearchParams({
    timeMin: startOfDay,
    timeMax: endOfDay,
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const res = await fetch(`${CALENDAR_API}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch calendar events');
  }

  const data = await res.json();
  return data.items || [];
}

// Fetch upcoming events (next 7 days)
export async function getUpcomingEvents(accessToken: string, days: number = 7): Promise<CalendarEvent[]> {
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  const res = await fetch(`${CALENDAR_API}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch calendar events');
  }

  const data = await res.json();
  return data.items || [];
}

// Create a calendar event
export async function createCalendarEvent(
  accessToken: string,
  event: { summary: string; description?: string; start: string; end: string; location?: string }
): Promise<CalendarEvent> {
  const res = await fetch(`${CALENDAR_API}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.start },
      end: { dateTime: event.end },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create calendar event');
  }

  return res.json();
}

// Format event time for display
export function formatEventTime(event: CalendarEvent): string {
  const start = event.start.dateTime || event.start.date;
  if (!start) return '';
  const date = new Date(start);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
