export function getRequestParam(param: string): string | null {
  return new URL(document.location.toString()).searchParams.get(param)
}