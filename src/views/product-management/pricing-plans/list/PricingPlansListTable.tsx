'use client'

// React Imports
import { useMemo, useRef, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import qs from 'qs'
import { useQueryClient } from '@tanstack/react-query'

// Util Imports
import { toast } from 'react-toastify'

import type { components } from '@/@core/api/v1'
import DeleteModal from '@/@core/components/modals/DeleteModal'
import type { getDictionary } from '@/utils/getDictionary'
import Table from '@/@core/components/table/Table'
import { useFetch } from '@/utils/clientRequest'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import CustomIconButton from '@/@core/components/mui/IconButton'
import { translateReplacer } from '@/utils/translateReplacer'
import { type DrawerHandle } from '@/@core/components/drawers/FormDrawer'
import type { WithActions, ModalHandle } from '@/@core/types'
import PricingPlanForm from '../components/PricingPlanForm'

// Column Definitions
const columnHelper = createColumnHelper<WithActions<components['schemas']['PricingPlanResource']>>()

const PricingPlansListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // States
  const [selectedItem, setSelectedItem] = useState<{
    id: number | undefined
    status: 'editing' | 'deleting' | 'adding'
  }>()

  // Hooks

  const router = useRouter()

  const { queryParams, setQueryParams } = useQueryParams()

  const deleteModalRef = useRef<ModalHandle>(null)

  const formDrawerRef = useRef<DrawerHandle>(null)

  const { data, isFetching: isLoadingPricingPlansList } = useFetch().useQuery('get', '/pricing-plan', {
    params: {
      query: queryParams
    }
  })

  const { mutateAsync: deletePricingPlan, isPending: isDeletingPricingPlan } = useFetch().useMutation(
    'delete',
    '/pricing-plan/{pricingPlan}'
  )

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const modalTranslate = dictionary.modal

  const columns = useMemo<ColumnDef<WithActions<components['schemas']['PricingPlanResource']>, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: keywordsTranslate.title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.title}
              </Typography>
            </div>
          </div>
        )
      }),

      columnHelper.accessor('actions', {
        header: keywordsTranslate.actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <CustomIconButton
              size='small'
              title={keywordsTranslate.edit}
              onClick={() => {
                formDrawerRef.current?.open()
                setSelectedItem({ id: row.original.id ?? 0, status: 'editing' })
              }}
            >
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </CustomIconButton>
            <CustomIconButton
              size='small'
              title={keywordsTranslate.delete}
              onClick={() => {
                setSelectedItem({ id: row.original.id ?? 0, status: 'deleting' })
                deleteModalRef.current?.open()
              }}
            >
              <i className='ri-delete-bin-7-line text-[22px] text-textSecondary' />
            </CustomIconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  // Functions
  const handleDeletePricingPlan = async () => {
    await deletePricingPlan({
      params: {
        path: {
          pricingPlan: selectedItem?.id ?? 0
        }
      }
    })
      .then(res => {
        toast.success(res.message)

        deleteModalRef.current?.close()

        if (data?.data?.length === 1) {
          setQueryParams(queryParams => ({ ...queryParams, page: (queryParams?.page ?? 0) - 1 }))
          router.push(`?${qs.stringify({ ...queryParams, page: (queryParams?.page ?? 0) - 1 })}`)
        }
      })
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: [
            'get',
            '/pricing-plan',
            {
              params: {
                query: queryParams
              }
            }
          ]
        })
      )
  }

  return (
    <>
      <Card>
        <Table
          columns={columns}
          data={data}
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.pricing_plans}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.page_limit
          }}
          listTitle={keywordsTranslate.pricing_plans}
          addFunctionality={() => {
            formDrawerRef.current?.open()
            setSelectedItem({ id: undefined, status: 'adding' })
          }}
          isLoading={isLoadingPricingPlansList}
        />
        <DeleteModal
          ref={deleteModalRef}
          title={`${keywordsTranslate.delete} ${keywordsTranslate.pricing_plan}`}
          handleConfirm={handleDeletePricingPlan}
          isLoadingConfirmation={isDeletingPricingPlan}
        >
          {translateReplacer(modalTranslate.delete, `${keywordsTranslate.pricing_plan}`)}
        </DeleteModal>

        <PricingPlanForm
          ref={formDrawerRef}
          dictionary={dictionary}
          selectedItem={selectedItem}
          listQueryParams={queryParams}
        />
      </Card>
    </>
  )
}

export default PricingPlansListTable
