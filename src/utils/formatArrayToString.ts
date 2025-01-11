export const formatArrayToString = (data: string[] | undefined): string => {
  return (data as string[])?.map((item: string) => item).join(',') || ''
}
