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

import { Chip } from '@mui/material'

import type { components, operations } from '@/@core/api/v1'
import DeleteModal from '@/@core/components/modals/DeleteModal'
import type { getDictionary } from '@/utils/getDictionary'
import Table from '@/@core/components/table/Table'
import { useFetch } from '@/utils/clientRequest'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import { menuUrls } from '@/@menu/utils/menuUrls'
import Link from '@/components/Link'
import CustomIconButton from '@/@core/components/mui/IconButton'
import { translateReplacer } from '@/utils/translateReplacer'
import type { ThemeColor, ModalHandle } from '@/@core/types'
import ToggleModal from '@/@core/components/modals/ToggleModal'
import Image from '@/@core/components/image'

type CategoryWithActionsType = components['schemas']['CategoryResource'] & {
  actions?: string
}

// Column Definitions
const columnHelper = createColumnHelper<CategoryWithActionsType>()

const CategoriesListTable = ({
  dictionary,
  type
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  type: NonNullable<operations['getCategories']['parameters']['query']>['filter[type]']
}) => {
  // States
  const [selectedItemId, setSelectedItemId] = useState<number>()

  // Hooks

  const router = useRouter()

  const { queryParams, setQueryParams } = useQueryParams()

  const deleteModalRef = useRef<ModalHandle>(null)

  const toggleModalRef = useRef<ModalHandle>(null)

  const { data, isFetching: isLoadingCategoriesList } = useFetch().useQuery('get', '/category', {
    params: {
      query: {
        'filter[type]': type,
        ...queryParams
      }
    }
  })

  const { mutateAsync: deleteCategory, isPending: isDeletingCategory } = useFetch().useMutation(
    'delete',
    '/category/{category}'
  )

  const { mutateAsync: toggleCategory, isPending: isTogglingCategory } = useFetch().useMutation(
    'post',
    '/category/toggle/{category}'
  )

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const modalTranslate = dictionary.modal

  const columns = useMemo<ColumnDef<CategoryWithActionsType, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: keywordsTranslate.title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Image
              src={row.original.image?.original_url ?? ''}
              alt='category-image'
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
      columnHelper.accessor('type', {
        header: keywordsTranslate.type,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Typography color='text.primary'>{row.original.type?.label}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('ordering', {
        header: keywordsTranslate.ordering,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.ordering}
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
            <CustomIconButton size='small' title={keywordsTranslate.edit}>
              <Link className='flex' href={`${menuUrls.product_management.category.edit}/${row.original.id}`}>
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
  const handleDeleteCategory = async () => {
    await deleteCategory({
      params: {
        path: {
          category: selectedItemId ?? 0
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
            '/category',
            {
              params: {
                query: queryParams
              }
            }
          ]
        })
      )
  }

  const handleToggleCategory = async () => {
    await toggleCategory({
      params: {
        path: {
          category: selectedItemId ?? 0
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
            '/category',
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
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.category}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.per_page
          }}
          listTitle={keywordsTranslate.categories}
          addUrl={menuUrls.product_management.category.add}
          isLoading={isLoadingCategoriesList}
        />
        <DeleteModal
          ref={deleteModalRef}
          title={`${keywordsTranslate.delete} ${keywordsTranslate.category}`}
          handleConfirm={handleDeleteCategory}
          isLoadingConfirmation={isDeletingCategory}
        >
          {translateReplacer(modalTranslate.delete, keywordsTranslate.category)}
        </DeleteModal>
        <ToggleModal
          ref={toggleModalRef}
          title={`${keywordsTranslate.toggle} ${keywordsTranslate.category}`}
          handleConfirm={handleToggleCategory}
          isLoadingConfirmation={isTogglingCategory}
        >
          {translateReplacer(modalTranslate.toggle, keywordsTranslate.category)}
        </ToggleModal>
      </Card>
    </>
  )
}

export default CategoriesListTable
