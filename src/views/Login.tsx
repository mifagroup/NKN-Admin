'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, minLength, string, email, pipe, optional, maxLength } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import classnames from 'classnames'

// Type Imports
import { IconButton, InputAdornment } from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import type { Mode } from '@core/types'
import type { Locale } from '@/configs/i18n'
import type { getDictionary } from '@/utils/getDictionary'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import TextField from '@/@core/components/textField'

type ErrorType = {
  message: string[]
}

const Login = ({ mode, dictionary }: { mode: Mode; dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // States
  const [errorState, setErrorState] = useState<ErrorType | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-1-dark.png'

  const lightImg = '/images/pages/auth-v2-mask-1-light.png'

  const darkIllustration = '/images/illustrations/characters/5.png'

  const lightIllustration = '/images/illustrations/characters/5.png'

  const borderedDarkIllustration = '/images/illustrations/characters/5.png'

  const borderedLightIllustration = '/images/illustrations/characters/5.png'

  const keywordsTranslation = dictionary.keywords

  const loginTranslation = dictionary.login

  type FormData = InferInput<typeof schema>

  // Schema
  const schema = object({
    email: pipe(string(), email(loginTranslation.enter_valid_email)),
    password: pipe(string(), minLength(6, loginTranslation.enter_password))
  })

  // Hooks
  const router = useRouter()

  const searchParams = useSearchParams()

  const { lang: locale } = useParams()

  const { settings } = useSettings()

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => {
    setIsPasswordShown(prev => !prev)
  }

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    setIsLoading(true)

    const res = await signIn('login', {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl: getLocalizedUrl('/', locale as string)
    })

    if (res?.error) {
      setIsLoading(false)

      const error = res.error ? JSON.parse(res.error) : null

      const errors = error.errors

      errors?.['email'] && setError('email', { message: errors['email'] })
      errors?.['password'] && setError('password', { message: errors['password'] })
    }
 
    if (res && res.ok && res.error === null) {
      // Vars
      setIsLoading(false)

      const redirectURL = searchParams.get('redirectTo') ?? '/'

      router.replace(getLocalizedUrl(redirectURL, locale as Locale))
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[673px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div className='mx-auto'>
            <Logo hasLogoText={false} className='h-[80px] w-[140px]' />
          </div>
          <div className='flex flex-col gap-y-2'>
            <Typography variant='h5' className='text-center'>
              {keywordsTranslation.login}
            </Typography>
            <Typography className='text-center' variant='body2'>
              {loginTranslation.enter_to_login?.replace('$', keywordsTranslation.email)}
            </Typography>
          </div>
          {/* <Alert icon={false} className='bg-[var(--mui-palette-primary-lightOpacity)]'>
            <Typography variant='body2' color='primary'>
              Email: <span className='font-medium'>admin@materialize.com</span> / Pass:{' '}
              <span className='font-medium'>admin</span>
            </Typography>
          </Alert> */}

          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
            <Controller
              name={'email'}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  autoFocus
                  type={'email'}
                  label={keywordsTranslation.email}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  {...((errors.email || errorState !== null) && {
                    error: true,
                    helperText: errors?.email?.message || errorState?.message[0]
                  })}
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={keywordsTranslation.password}
                  id='login-password'
                  type={isPasswordShown ? 'text' : 'password'}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState !== null && setErrorState(null)
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={e => e.preventDefault()}
                          aria-label='toggle password visibility'
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...(errors.password && { error: true, helperText: errors.password.message })}
                />
              )}
            />
            <LoadingButton
              fullWidth
              variant='contained'
              type='submit'
              color='primary'
              className='flex justify-between !px-4'
              loading={isLoading}
            >
              {keywordsTranslation.login}
              <i className='ri-arrow-left-circle-line' />
            </LoadingButton>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
