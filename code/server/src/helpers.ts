import z from 'zod';

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