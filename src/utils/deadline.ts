export function isOverdue(deadline: string): boolean {
  if (!deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    return new Date(deadline + 'T12:00:00') < today;
  }

  const m = deadline.match(/^Uke\s*(\d+)$/i);
  if (m) {
    const week = parseInt(m[1]);
    const year = today.getFullYear();
    const jan4 = new Date(year, 0, 4);
    const mon = new Date(jan4);
    mon.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + (week - 1) * 7 + 6);
    return sun < today;
  }

  return false;
}
