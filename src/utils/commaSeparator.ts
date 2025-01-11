export const commaSeparator = (num: number | string): string => {
  if (num === null || num === undefined) return ''

  // Convert the number to a string if it is not already
  const numStr = num.toString()

  // Split the string into integer and decimal parts
  const [integerPart, decimalPart] = numStr.split('.')

  // Use a regular expression to add commas to the integer part
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // Recombine the integer and decimal parts (if any)
  return decimalPart ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart
}
