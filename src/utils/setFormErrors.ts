import { type FieldValues, type UseFormSetError, type Path } from 'react-hook-form'

export const setFormErrors = <T extends FieldValues>(e: any, setError: UseFormSetError<T>) => {
  if (e.status !== 500)
    for (const [key, messages] of Object.entries(e?.errors)) {
      setError(key as Path<T>, {
        type: 'manual',
        message: (messages as string[])?.map(message => message).join(', ')
      })
    }
}
