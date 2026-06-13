/**
 * Best-effort human description of a 5-field cron expression for the
 * "Active schedule" card. Covers the common shapes the app generates
 * (daily, hourly, every N hours, weekly); falls back to the raw expression.
 */
const DOW = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function hhmm(minute: string, hour: string): string {
  const h = String(parseInt(hour, 10)).padStart(2, "0");
  const m = String(parseInt(minute, 10)).padStart(2, "0");
  return `${h}:${m}`;
}

export function describeCron(expr: string | null | undefined): string {
  if (!expr) return "Not scheduled";
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return expr;
  const [minute, hour, dom, month, dow] = parts;

  // Every N hours: "0 */N * * *"
  const everyHours = hour.match(/^\*\/(\d+)$/);
  if (minute !== "*" && everyHours && dom === "*" && month === "*" && dow === "*") {
    return `Every ${everyHours[1]} hours`;
  }

  // Hourly: "0 * * * *"
  if (minute !== "*" && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return "Every hour";
  }

  // Weekly: "0 9 * * 1"
  if (
    minute !== "*" &&
    hour !== "*" &&
    dom === "*" &&
    month === "*" &&
    /^\d+$/.test(dow)
  ) {
    return `Every ${DOW[parseInt(dow, 10) % 7]} at ${hhmm(minute, hour)}`;
  }

  // Daily: "0 8 * * *"
  if (
    minute !== "*" &&
    hour !== "*" &&
    dom === "*" &&
    month === "*" &&
    dow === "*"
  ) {
    return `Every day at ${hhmm(minute, hour)}`;
  }

  return expr;
}
