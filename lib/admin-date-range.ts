const INDIA_TIMEZONE_OFFSET_MINUTES = 330;

function parseIndiaDateBoundary(dateValue: string, endOfDay: boolean) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
    if (!match) return null;

    const [, year, month, day] = match;
    const utcTime = Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        endOfDay ? 23 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 59 : 0,
        endOfDay ? 999 : 0,
    ) - INDIA_TIMEZONE_OFFSET_MINUTES * 60 * 1000;

    return new Date(utcTime);
}

export function buildIndiaCreatedAtRange(from?: string | null, to?: string | null) {
    const createdAtRange: Record<string, Date> = {};

    if (from) {
        const start = parseIndiaDateBoundary(from, false);
        if (start) createdAtRange.$gte = start;
    }

    if (to) {
        const end = parseIndiaDateBoundary(to, true);
        if (end) createdAtRange.$lte = end;
    }

    return Object.keys(createdAtRange).length > 0 ? createdAtRange : null;
}