/**
 * Shared utilities.
 */

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format an ISO timestamp into KST short form (e.g. "오후 9:25").
 */
export function formatKstTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
  } catch {
    return iso;
  }
}

/**
 * Format an ISO date into KST short form (e.g. "2026.07.12 (일) 23:00").
 */
export function formatKstDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
  } catch {
    return iso;
  }
}

/**
 * Format an ISO timestamp into a 12-hour KST clock (e.g. "8:30 PM").
 */
export function formatKstClock(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Seoul",
    });
  } catch {
    return iso;
  }
}

/**
 * Format an ISO timestamp into KST "MM.DD" (e.g. "06.05").
 */
export function formatKstMonthDay(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Seoul",
    }).replace("/", ".");
  } catch {
    return iso;
  }
}
