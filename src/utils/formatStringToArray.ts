export const formatStringToArray = (data: string | undefined): string[] => {
  return (data as string)?.split(',') || []
}
