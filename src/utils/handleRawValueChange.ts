export const handleRawValueChange = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  onChange: (value: number) => void
): void => {
  const rawValue = event.target.value.replace(/,/g, '')

  if (!isNaN(+rawValue)) {
    onChange(+rawValue)
  }
}
