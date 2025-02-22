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

import { Chip } from '@mui/material'

import type { components } from '@/@core/api/v1'
import DeleteModal from '@/@core/components/modals/DeleteModal'
import type { getDictionary } from '@/utils/getDictionary'
import Table from '@/@core/components/table/Table'
import { useFetch } from '@/utils/clientRequest'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import CustomIconButton from '@/@core/components/mui/IconButton'
import { translateReplacer } from '@/utils/translateReplacer'
import { type DrawerHandle } from '@/@core/components/drawers/FormDrawer'
import type { ThemeColor, WithActions, ModalHandle } from '@/@core/types'
import ToggleModal from '@/@core/components/modals/ToggleModal'
import ProfitForm from '../components/ProfitForm'
import { commaSeparator } from '@/utils/commaSeparator'

// Column Definitions
const columnHelper = createColumnHelper<WithActions<components['schemas']['ProfitResource']>>()

const ProfitListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // States
  const [selectedItem, setSelectedItem] = useState<{
    id: number | undefined
    status: 'editing' | 'deleting' | 'adding' | 'toggling'
  }>()

  // Hooks

  const router = useRouter()

  const { queryParams, setQueryParams } = useQueryParams()

  const deleteModalRef = useRef<ModalHandle>(null)

  const toggleModalRef = useRef<ModalHandle>(null)

  const formDrawerRef = useRef<DrawerHandle>(null)

  const { data, isFetching: isLoadingProfitList } = useFetch().useQuery('get', '/profit', {
    params: {
      query: queryParams
    }
  })

  const { mutateAsync: deleteProfit, isPending: isDeletingProfit } = useFetch().useMutation(
    'delete',
    '/profit/{profit}'
  )

  const { mutateAsync: toggleProfit, isPending: isTogglingProfit } = useFetch().useMutation(
    'post',
    '/profit/toggle/{profit}'
  )

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const modalTranslate = dictionary.modal

  const columns = useMemo<ColumnDef<WithActions<components['schemas']['ProfitResource']>, any>[]>(
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
        ),
        enableResizing: true,
        size: 100
      }),
      columnHelper.accessor('month', {
        header: keywordsTranslate.month,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.month}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('value', {
        header: keywordsTranslate.value,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.value} {keywordsTranslate.percent}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('min_price', {
        header: keywordsTranslate.min_price,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.min_price?.formatted}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('published', {
        header: keywordsTranslate.status,
        cell: ({ row }) => (
          <Chip
            label={row.original.published?.label}
            variant='tonal'
            color={row.original.published?.color as ThemeColor}
            size='small'
          />
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
            <CustomIconButton
              size='small'
              title={keywordsTranslate.toggle}
              onClick={() => {
                setSelectedItem({ id: row.original.id, status: 'toggling' })
                toggleModalRef.current?.open()
              }}
            >
              <i className='ri-switch-line text-[22px] text-textSecondary' />
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
  const handleDeleteProfit = async () => {
    await deleteProfit({
      params: {
        path: {
          profit: selectedItem?.id ?? 0
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
            '/profit',
            {
              params: {
                query: queryParams
              }
            }
          ]
        })
      )
  }

  const handleToggleProfit = async () => {
    await toggleProfit({
      params: {
        path: {
          profit: selectedItem?.id ?? 0
        }
      }
    })
      .then(res => {
        toast.success(res.message)

        toggleModalRef.current?.close()

        setSelectedItem({ id: undefined, status: 'toggling' })

        if (data?.data?.length === 1) {
          setQueryParams(queryParams => ({ ...queryParams, page: (queryParams?.page ?? 0) - 1 }))
          router.push(`?${qs.stringify({ ...queryParams, page: (queryParams?.page ?? 0) - 1 })}`)
        }
      })
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: [
            'get',
            '/profit',
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
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.profits}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.per_page
          }}
          listTitle={keywordsTranslate.profits}
          addFunctionality={() => {
            formDrawerRef.current?.open()
            setSelectedItem({ id: undefined, status: 'adding' })
          }}
          isLoading={isLoadingProfitList}
        />
        <DeleteModal
          ref={deleteModalRef}
          title={`${keywordsTranslate.delete} ${keywordsTranslate.profit}`}
          handleConfirm={handleDeleteProfit}
          isLoadingConfirmation={isDeletingProfit}
        >
          {translateReplacer(modalTranslate.delete, `${keywordsTranslate.profit}`)}
        </DeleteModal>
        <ToggleModal
          ref={toggleModalRef}
          title={`${keywordsTranslate.toggle} ${keywordsTranslate.profit}`}
          handleConfirm={handleToggleProfit}
          isLoadingConfirmation={isTogglingProfit}
        >
          {translateReplacer(modalTranslate.toggle, keywordsTranslate.profit)}
        </ToggleModal>
        <ProfitForm
          ref={formDrawerRef}
          dictionary={dictionary}
          selectedItem={selectedItem}
          listQueryParams={queryParams}
        />
      </Card>
    </>
  )
}

export default ProfitListTable
