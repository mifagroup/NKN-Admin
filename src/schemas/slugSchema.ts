import { z } from 'zod'

export const slugSchema = (
  hyphenStartError: string,
  consecutiveHyphensError: string,
  lowercaseNumberHyphenLengthError: string,
  endWithHyphenError: string,
  isEditing: boolean = false
) => {
  const baseSchema = z
    .string()
    .refine(value => !value.startsWith('-'), { message: hyphenStartError })
    .refine(value => !/--/.test(value), { message: consecutiveHyphensError })
    .refine(value => /^[\p{L}\p{N}-]{1,100}$/u.test(value), { message: lowercaseNumberHyphenLengthError })
    .refine(value => !value.endsWith('-'), { message: endWithHyphenError })

  return isEditing ? baseSchema : baseSchema.optional()
}
