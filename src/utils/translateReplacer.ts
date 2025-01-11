export const translateReplacer = (content: string, replaceText: string): string => {
  return content.replace('$', replaceText)
}
