import { z } from 'zod';
import { Workshop, WorkshopParamsSchema } from '@/sharedTypes';

/**
 * Factory function to create a Zod schema, inferred TypeScript type, and type guard.
 * @param schema The Zod schema for the type.
 * @returns A tuple containing the inferred TypeScript type and the type guard function.
 */
export function createTypeGuard<T extends z.ZodTypeAny>(
  schema: T
): (data: unknown) => data is z.infer<T> {
  return (data: unknown): data is z.infer<T> => schema.safeParse(data).success;
}

export function titleCase(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function uniqBy<T>(elts: T[], accessor: (elt: T) => string) {
  const eltsObj: Record<string, T> = {};
  elts.forEach((elt) => {
    eltsObj[accessor(elt)] = elt;
  });
  return Object.values(eltsObj);
}

export function computeStartEnd({
  date,
  startTime,
  duration,
}: {
  date: string;
  startTime: string;
  duration: number;
}) {
  const [hour, minute] = startTime.split(':').map(Number);
  const paddedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const start = new Date(`${date}T${paddedTime}`);
  const end = new Date(start.getTime() + duration * 60000);

  return { start, end };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function checkForConflicts(
  workshops: Workshop[],
  newEvent: z.infer<typeof WorkshopParamsSchema>
) {
  const { start, end } = computeStartEnd(newEvent);

  if (start < new Date()) {
    return 'Cannot schedule workshops in the past.';
  }

  const hasConflict = workshops.some((workshop) => {
    const existingStart = new Date(workshop.start);
    const existingEnd = new Date(workshop.end);

    const sameStudio = workshop.resourceId === newEvent.resourceId;
    const overlaps = start < existingEnd && end > existingStart;

    return sameStudio && overlaps;
  });

  return hasConflict
    ? 'This time slot conflicts with an existing workshop.'
    : null;
}

/**
 * Returns an array of valid durations for a workshop.
 * @param startTime - Start time of the workshop
 * @returns Array of valid durations
 */
const getValidDurations = (startTime: string) => {
  if (!startTime) return [];

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const start = new Date();
  start.setHours(startHour, startMinute, 0);

  const endLimit = new Date();
  endLimit.setHours(18, 0, 0);

  const validDurations = [];

  for (let i = 1; i <= 12; i++) {
    const durationInMinutes = i * 15;
    const potentialEnd = new Date(start.getTime() + durationInMinutes * 60000);
    if (potentialEnd <= endLimit) {
      validDurations.push(durationInMinutes);
    }
  }

  return validDurations;
};

export const getDurationOptions = (startTime: string) => {
  const durations = getValidDurations(startTime);
  return durations.map((minutes) => {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    const label =
      `${hours ? `${hours} hr${hours > 1 ? 's' : ''}` : ''}` +
      `${remaining ? ` ${remaining} min` : ''}`;

    return {
      value: minutes.toString(),
      label: label.trim(),
    };
  });
};

export const timeOptions = Array.from({ length: 36 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const label = `${hours % 12 === 0 ? 12 : hours % 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
  return { value, label };
});
