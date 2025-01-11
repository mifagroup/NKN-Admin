'use client'

// React Imports
import { useMemo, useRef, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import qs from 'qs'
import { useQueryClient } from '@tanstack/react-query'

// Util Imports
import { toast } from 'react-toastify'

import { Chip, Tooltip } from '@mui/material'

import type { components } from '@/@core/api/v1'
import DeleteModal from '@/@core/components/modals/DeleteModal'
import type { getDictionary } from '@/utils/getDictionary'
import Table from '@/@core/components/table/Table'
import { useFetch } from '@/utils/clientRequest'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import { menuUrls } from '@/@menu/utils/menuUrls'
import Link from '@/components/Link'
import CustomIconButton from '@/@core/components/mui/IconButton'
import { translateReplacer } from '@/utils/translateReplacer'
import type { ThemeColor, WithActions, ModalHandle } from '@/@core/types'
import ToggleModal from '@/@core/components/modals/ToggleModal'
import Image from '@/@core/components/image'

// Column Definitions
const columnHelper = createColumnHelper<WithActions<components['schemas']['BrandResource']>>()

const BrandsListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // States
  const [selectedItemId, setSelectedItemId] = useState<number>()

  // Hooks

  const router = useRouter()

  const { queryParams, setQueryParams } = useQueryParams()

  const deleteModalRef = useRef<ModalHandle>(null)

  const toggleModalRef = useRef<ModalHandle>(null)

  const { data, isFetching: isLoadingBrandsList } = useFetch().useQuery('get', '/brand', {
    params: {
      query: queryParams
    }
  })

  const { mutateAsync: deleteBrand, isPending: isDeletingBrand } = useFetch().useMutation('delete', '/brand/{brand}')

  const { mutateAsync: toggleBrand, isPending: isTogglingBrand } = useFetch().useMutation(
    'post',
    '/brand/toggle/{brand}'
  )

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const modalTranslate = dictionary.modal

  const columns = useMemo<ColumnDef<WithActions<components['schemas']['BrandResource']>, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: keywordsTranslate.title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Image
              src={row.original.image?.original_url ?? ''}
              alt='brand-image'
              className='rounded-[10px] object-cover'
            />
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.title}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('ordering', {
        header: keywordsTranslate.ordering,
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.ordering}
          </Typography>
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
            <CustomIconButton size='small' title={keywordsTranslate.edit}>
              <Link className='flex' href={`${menuUrls.product_management.brand.edit}/${row.original.id}`}>
                <i className='ri-edit-box-line text-[22px] text-textSecondary' />
              </Link>
            </CustomIconButton>
            <CustomIconButton
              size='small'
              title={keywordsTranslate.delete}
              onClick={() => {
                setSelectedItemId(row.original.id)
                deleteModalRef.current?.open()
              }}
            >
              <i className='ri-delete-bin-7-line text-[22px] text-textSecondary' />
            </CustomIconButton>
            <CustomIconButton
              size='small'
              title={keywordsTranslate.toggle}
              onClick={() => {
                setSelectedItemId(row.original.id)
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
  const handleDeleteBrand = async () => {
    await deleteBrand({
      params: {
        path: {
          brand: selectedItemId ?? 0
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
            '/brand',
            {
              params: {
                query: queryParams
              }
            }
          ]
        })
      )
  }

  const handleToggleBrand = async () => {
    await toggleBrand({
      params: {
        path: {
          brand: selectedItemId ?? 0
        }
      }
    })
      .then(res => {
        toast.success(res.message)

        toggleModalRef.current?.close()

        if (data?.data?.length === 1) {
          setQueryParams(queryParams => ({ ...queryParams, page: (queryParams?.page ?? 0) - 1 }))
          router.push(`?${qs.stringify({ ...queryParams, page: (queryParams?.page ?? 0) - 1 })}`)
        }
      })
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: [
            'get',
            '/brand',
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
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.brand}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.page_limit
          }}
          listTitle={keywordsTranslate.brands}
          addUrl={menuUrls.product_management.brand.add}
          isLoading={isLoadingBrandsList}
        />
        <DeleteModal
          ref={deleteModalRef}
          title={`${keywordsTranslate.delete} ${keywordsTranslate.brand}`}
          handleConfirm={handleDeleteBrand}
          isLoadingConfirmation={isDeletingBrand}
        >
          {translateReplacer(modalTranslate.delete, keywordsTranslate.brand)}
        </DeleteModal>
        <ToggleModal
          ref={toggleModalRef}
          title={`${keywordsTranslate.toggle} ${keywordsTranslate.brand}`}
          handleConfirm={handleToggleBrand}
          isLoadingConfirmation={isTogglingBrand}
        >
          {translateReplacer(modalTranslate.toggle, keywordsTranslate.brand)}
        </ToggleModal>
      </Card>
    </>
  )
}

export default BrandsListTable
