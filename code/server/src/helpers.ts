import z from 'zod';
import { Workshop, WorkshopForm } from './sharedTypes';

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

export function checkForConflicts(
  workshops: Workshop[],
  newEvent: WorkshopForm
) {
  const { start, end } = computeStartEnd(newEvent);

  if (start < new Date()) {
    return 'Cannot schedule workshops in the past.';
  }

  const hasConflict = workshops.some((workshop) => {
    const existingStart = new Date(workshop.start);
    const existingEnd = new Date(workshop.end);

    const sameStudio = workshop.studioId === newEvent.studioId;
    const overlaps = start < existingEnd && end > existingStart;

    return sameStudio && overlaps;
  });

  return hasConflict
    ? 'This time slot conflicts with an existing workshop.'
    : null;
}
