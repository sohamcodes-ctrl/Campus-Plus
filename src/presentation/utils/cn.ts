export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: boolean | undefined | null };

/**
 * Lightweight classNames utility with zero external dependencies.
 * Joins truthy class strings and handles conditional class objects.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(" ").trim();
}
