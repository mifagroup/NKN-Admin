'use client'

// React Imports
import { forwardRef, useEffect } from 'react'

// Third-party Imports
import { Box, LinearProgress } from '@mui/material'
import { type SubmitHandler, Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Type Imports
import LoadingButton from '@mui/lab/LoadingButton'
import { toast } from 'react-toastify'

// Hook Imports
import { useQueryClient } from '@tanstack/react-query'

import { useFetch } from '@/utils/clientRequest'
import { translateReplacer } from '@/utils/translateReplacer'

// Component Imports
import { type components } from '@/@core/api/v1'
import type { getDictionary } from '@/utils/getDictionary'
import FormDrawer, { type DrawerHandle } from '@/@core/components/drawers/FormDrawer'
import { useStatuses } from '@/@core/hooks/useStatuses'
import { setFormErrors } from '@/utils/setFormErrors'
import TextField from '@/@core/components/textField'

interface UnitFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  selectedItem?: { id: number | undefined; status: 'editing' | 'deleting' | 'adding' }
  listQueryParams: Partial<components['parameters']>
}

const PricingPlanForm = forwardRef<DrawerHandle, UnitFormProps>(
  ({ dictionary, selectedItem, listQueryParams }, ref) => {
    // Vars
    const keywordsTranslate = dictionary?.keywords

    const inputTranslate = dictionary?.input

    const PricingPlansTranslate = dictionary?.product_management?.pricing_plans

    type FormData = z.infer<typeof schema>

    // Schema
    const schema = z.object({
      title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
      application_percent: z.number().optional(),
      website_percent: z.number().optional()
    })

    // Hooks
    const queryClient = useQueryClient()

    const statuses = useStatuses()

    const {
      data: singlePricingPlanData,
      isLoading: isLoadingPricingPlan,
      isFetching
    } = useFetch().useQuery(
      'get',
      '/pricing-plan/{pricingPlan}',
      {
        params: {
          path: {
            pricingPlan: selectedItem?.id ?? 0
          }
        }
      },
      {
        enabled: !!selectedItem?.id
      }
    )

    const singlePricingPlan = singlePricingPlanData?.data

    useEffect(() => {
      if (!isFetching && selectedItem?.status === 'editing') {
        handleOpenDrawer()
        setValue('title', singlePricingPlan?.title ?? '')
        setValue('application_percent', singlePricingPlan?.application_percent?.price ?? 0)
        setValue('website_percent', singlePricingPlan?.website_percent?.price ?? 0)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFetching, selectedItem?.status, selectedItem?.id])

    useEffect(() => {
      if (selectedItem?.status === 'adding') reset()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItem?.status])

    const { mutateAsync: addPricingPlan, isPending: isAddingPricingPlan } = useFetch().useMutation(
      'post',
      '/pricing-plan'
    )

    const { mutateAsync: editPricingPlan, isPending: isEditingPricingPlan } = useFetch().useMutation(
      'put',
      '/pricing-plan/{pricingPlan}'
    )

    const {
      control,
      handleSubmit,
      formState: { errors },
      setError,
      setValue,
      reset
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {}
    })

    // Functions
    const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
      if (!selectedItem?.id) {
        await addPricingPlan({
          body: {
            title: data.title,
            application_percent: data.application_percent ?? 0,
            website_percent: data.website_percent ?? 0
          }
        })
          .then(res => {
            toast.success(res.message)
            handleCloseDrawer()
            queryClient.invalidateQueries({
              queryKey: [
                'get',
                '/pricing-plan',
                {
                  params: {
                    query: listQueryParams
                  }
                }
              ]
            })

            if (!selectedItem?.id) {
              reset()
            }
          })
          .catch(e => {
            setFormErrors(e, setError)
          })
      } else {
        await editPricingPlan({
          body: {
            title: data.title,
            application_percent: data.application_percent ?? 0,
            website_percent: data.website_percent ?? 0
          },
          params: {
            path: {
              pricingPlan: selectedItem?.id
            }
          }
        })
          .then(res => {
            toast.success(res.message)
            handleCloseDrawer()
            queryClient.invalidateQueries({
              queryKey: [
                'get',
                '/pricing-plan',
                {
                  params: {
                    query: listQueryParams
                  }
                }
              ]
            })

            if (!selectedItem?.id) {
              reset()
            }
          })
          .catch(e => {
            setFormErrors(e, setError)
          })
      }
    }

    const handleCloseDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.close()

    const handleOpenDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.open()

    if (selectedItem?.id && isFetching) {
      return <LinearProgress />
    }

    return (
      <FormDrawer
        title={`${selectedItem?.id ? keywordsTranslate.edit : keywordsTranslate.add} ${keywordsTranslate.pricing_plan}`}
        ref={ref}
      >
        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-y-6 p-5'>
            <Controller
              name='title'
              control={control}
              rules={{ required: true }}
              render={({ field }) => {
                return (
                  <TextField
                    {...field}
                    fullWidth
                    autoFocus
                    type='text'
                    placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.name)}
                    label={keywordsTranslate.name}
                    {...(errors.title && { error: true, helperText: errors.title.message })}
                  />
                )
              }}
            />

            <Controller
              name='application_percent'
              control={control}
              rules={{ required: true }}
              render={({ field }) => {
                return (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    value={field?.value ?? undefined}
                    onChange={event => field.onChange(+event.target.value)}
                    placeholder={translateReplacer(
                      inputTranslate.placeholder,
                      PricingPlansTranslate.application_percent
                    )}
                    label={PricingPlansTranslate.application_percent}
                    {...(errors.application_percent && { error: true, helperText: errors.application_percent.message })}
                  />
                )
              }}
            />
            <Controller
              name='website_percent'
              control={control}
              rules={{ required: true }}
              render={({ field }) => {
                return (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    value={field?.value ?? undefined}
                    onChange={event => field.onChange(+event.target.value)}
                    placeholder={translateReplacer(inputTranslate.placeholder, PricingPlansTranslate.website_percent)}
                    label={PricingPlansTranslate.website_percent}
                    {...(errors.website_percent && { error: true, helperText: errors.website_percent.message })}
                  />
                )
              }}
            />
          </div>
          <Box display={'flex'} alignItems={'center'} columnGap={2} justifyContent={'end'} paddingX={5}>
            <LoadingButton variant='outlined' color='error' onClick={handleCloseDrawer}>
              {keywordsTranslate?.cancel}
            </LoadingButton>
            <LoadingButton variant='contained' type='submit' loading={isAddingPricingPlan || isEditingPricingPlan}>
              {keywordsTranslate?.save}
            </LoadingButton>
          </Box>
        </form>
      </FormDrawer>
    )
  }
)

export default PricingPlanForm
