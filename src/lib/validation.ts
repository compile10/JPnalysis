export function sanitizeForLLM(input: string): string {
  return (
    input
      // Strip ASCII control chars except tab (\x09), LF (\x0A), CR (\x0D)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Strip Unicode bidirectional/formatting override characters
      .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
      .trim()
  );
}
