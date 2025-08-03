'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import {
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Typography
} from '@mui/material'
import { type SubmitHandler, Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Type Imports
import LoadingButton from '@mui/lab/LoadingButton'
import { toast } from 'react-toastify'

// Hook Imports
import { useFetch } from '@/utils/clientRequest'

// Component Imports
import type { getDictionary } from '@/utils/getDictionary'
import { setFormErrors } from '@/utils/setFormErrors'
import { menuUrls } from '@/@menu/utils/menuUrls'
import TextField from '@/@core/components/textField'
import DoctorAutocomplete from '@/@core/components/doctorAutocomplete'

const UserForm = ({ dictionary, id }: { dictionary: Awaited<ReturnType<typeof getDictionary>>; id?: number }) => {
  // Vars
  const router = useRouter()
  const keywordsTranslate = dictionary.keywords
  const validationErrors = dictionary.unique_validation_errors
  const messagesTranslate = (dictionary as any).messages
  const formsTranslate = (dictionary as any).forms  
  const fieldsTranslate = (dictionary as any).fields

  // State for showing password confirmation field
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(!id)
  
  // State for showing doctor selection field
  const [showDoctorSelection, setShowDoctorSelection] = useState(false)

  // Schema - matching the actual API structure
  const schema = z.object({
    firstname: z.string({ required_error: `${keywordsTranslate.first_name} ${keywordsTranslate.isRequired}` }),
    lastname: z.string({ required_error: `${keywordsTranslate.last_name} ${keywordsTranslate.isRequired}` }),
    email: z.string({ required_error: `${keywordsTranslate.email} ${keywordsTranslate.isRequired}` }).email({
      message: validationErrors.valid_email
    }),
    phone: z.string({ required_error: `${fieldsTranslate.phone} ${keywordsTranslate.isRequired}` }),
    role_id: z.number({ required_error: `${fieldsTranslate.role} ${keywordsTranslate.isRequired}` }),
    doctor_id: z.union([
      z.object({
        label: z.string().optional(),
        value: z.number().optional()
      }).optional(),
      z.null()
    ]).optional(),
    password: z.string().optional(),
    password_confirmation: z.string().optional()
  }).superRefine((data, ctx) => {
    // Password is required for new users
    if (!id && (!data.password || data.password.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${keywordsTranslate.password} ${keywordsTranslate.isRequired}`,
        path: ["password"]
      });
    }

    // Password must be at least 8 characters if provided
    if (data.password && data.password.length > 0 && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${keywordsTranslate.password} must be at least 8 characters`,
        path: ["password"]
      });
    }

    // Password confirmation must match if password is provided
    if (data.password && data.password.length > 0 && data.password !== data.password_confirmation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: fieldsTranslate.password_must_match,
          path: ["password_confirmation"]
        });
      }
      
      // Doctor is required when role is "doc" - we'll check this dynamically
      // Note: This validation will be handled by the server since we need to check the role name
    })

  type FormData = z.infer<typeof schema>

  // Hooks
  const { data: singleUserData, isLoading: isLoadingSingleUserData } = useFetch().useQuery(
    'get',
    '/users/{id}',
    {
      params: {
        path: {
          id: id ?? 0
        }
      }
    },
    {
      enabled: !!id
    }
  )

  const { data: rolesData, isLoading: isLoadingRoles } = useFetch().useQuery('get', '/roles')
  const roles = useMemo(() => rolesData?.data || [], [rolesData?.data])

  const singleUser = singleUserData?.data

  useEffect(() => {
    if (singleUser) {
      setValue('firstname', singleUser.first_name ?? '')
      setValue('lastname', singleUser.last_name ?? '')
      setValue('email', singleUser.email ?? '')
      setValue('phone', singleUser.phone ?? '')

      // Set role_id based on available data or default to 1
      setValue('role_id', 1)

      // Note: doctor_id will be handled by the API response when we have proper user data
      // For now, we'll set it to null and let the role change logic handle it
      setValue('doctor_id', null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleUser])

  const { mutateAsync: addUser, isPending: isAddingUser } = useFetch().useMutation('post', '/users')
  const { mutateAsync: editUser, isPending: isEditingUser } = useFetch().useMutation('put', '/users/{id}')

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role_id: 1
    }
  })

  // Watch password field to show/hide confirmation field in update mode
  const passwordValue = watch('password')
  
  // Watch role field to show/hide doctor selection
  const roleValue = watch('role_id')

  useEffect(() => {
    if (id) {
      // In update mode, show confirmation field only if password is being changed
      setShowPasswordConfirmation(Boolean(passwordValue && passwordValue.length > 0))
    }
  }, [passwordValue, id])

  useEffect(() => {
    // Show doctor selection field when "Doc" role is selected
    // We need to check if the selected role corresponds to a doctor role

    if (roleValue && roles.length > 0) {
      const selectedRole = roles.find((role: any) => role.id === roleValue)

      const isDoctorRole = Boolean(selectedRole?.name?.toLowerCase().includes('doc') || 
                          selectedRole?.name?.toLowerCase().includes('doctor'))

      setShowDoctorSelection(isDoctorRole)
      
      // Clear doctor_id if role is not doctor

      if (!isDoctorRole) {
        setValue('doctor_id', null)
      }
    } else {
      setShowDoctorSelection(false)
      setValue('doctor_id', null)
    }
  }, [roleValue, roles, setValue])

  // Functions

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (!id) {
      // Create user - use multipart/form-data

      const formData = new FormData()

      formData.append('firstname', data.firstname)
      formData.append('lastname', data.lastname)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      formData.append('role_id', String(data.role_id))

      if (data.doctor_id?.value) {
        formData.append('doctor_id', String(data.doctor_id.value))
      }

      formData.append('password', data.password || '')
      formData.append('password_confirmation', data.password_confirmation || '')

      if (!data.password) {
        setError('password', { message: `${keywordsTranslate.password} ${keywordsTranslate.isRequired}` })

        return
      }
      
      await addUser({
        body: formData as any
      })
        .then(() => {
          // @ts-ignore
          toast.success(messagesTranslate.user_created_successfully)
          router.push(menuUrls.user_management.users.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      // Update user - use application/x-www-form-urlencoded
      const updateData: Record<string, string> = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone
      }

      if (data.doctor_id?.value) {
        updateData.doctor_id = String(data.doctor_id.value)
      }

      if (data.password) {
        updateData.password = data.password
        updateData.password_confirmation = data.password_confirmation || ''
      }

      await editUser({
        body: updateData as any,
        params: {
          path: {
            id: id ?? 0
          }
        }
      })
        .then(() => {
          // @ts-ignore
          toast.success(messagesTranslate.user_updated_successfully)
          router.push(menuUrls.user_management.users.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  if (id && isLoadingSingleUserData) {
    return <LinearProgress />
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <Typography variant='h4' className='mbe-1'>
                    {id ? formsTranslate.edit_user : formsTranslate.add_user}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='firstname'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={keywordsTranslate.first_name}
                        error={!!errors.firstname}
                        helperText={errors.firstname?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='lastname'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={keywordsTranslate.last_name}
                        error={!!errors.lastname}
                        helperText={errors.lastname?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='email'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='email'
                        label={keywordsTranslate.email}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='phone'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={fieldsTranslate.phone}
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.role_id}>
                    <InputLabel>{fieldsTranslate.role}</InputLabel>
                    <Controller
                      name='role_id'
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label={fieldsTranslate.role}
                          disabled={isLoadingRoles}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        >
                          {isLoadingRoles ? (
                            <MenuItem disabled>{keywordsTranslate.loading}...</MenuItem>
                          ) : roles.length > 0 ? (
                            roles.map((role: any) => (
                              <MenuItem key={role.id} value={role.id}>
                                {role.name}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>{keywordsTranslate.noDataAvailable}</MenuItem>
                          )}
                        </Select>
                      )}
                    />
                    {errors.role_id && (
                      <FormHelperText>{errors.role_id.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {showDoctorSelection && (
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='doctor_id'
                      control={control}
                      render={({ field }) => (
                        <DoctorAutocomplete
                          label={fieldsTranslate.select_doctor}
                          value={field.value}
                          onChange={(data) => field.onChange(data)}
                          error={!!errors.doctor_id}
                          helperText={errors.doctor_id?.message}
                        />
                      )}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='password'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='password'
                        label={id ? fieldsTranslate.password_optional : keywordsTranslate.password}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                      />
                    )}
                  />
                </Grid>

                {showPasswordConfirmation && (
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='password_confirmation'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type='password'
                          label={fieldsTranslate.password_confirmation}
                          error={!!errors.password_confirmation}
                          helperText={errors.password_confirmation?.message}
                        />
                      )}
                    />
                  </Grid>
                )}

                <Grid item xs={12} className='flex gap-4 flex-wrap'>
                  <LoadingButton
                    loading={isAddingUser || isEditingUser}
                    disabled={isAddingUser || isEditingUser}
                    variant='contained'
                    type='submit'
                  >
                    {id ? keywordsTranslate.edit : keywordsTranslate.add}
                  </LoadingButton>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default UserForm 
 