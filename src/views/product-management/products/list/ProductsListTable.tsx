'use client'

// React Imports
import { useMemo, useRef, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Chip } from '@mui/material'

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
import type { WithActions, ModalHandle, ThemeColor } from '@/@core/types'
import Image from '@/@core/components/image'
import ProductForm from '../components/ProductForm'
import ToggleModal from '@/@core/components/modals/ToggleModal'
import { menuUrls } from '@/@menu/utils/menuUrls'

// Column Definitions
const columnHelper = createColumnHelper<WithActions<components['schemas']['ProductInterfaceResource']>>()

const ProductsListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // States
  const [selectedItem, setSelectedItem] = useState<{
    id: number | undefined
    status: 'deleting' | 'adding' | 'toggling'
  }>()

  // Hooks

  const router = useRouter()

  const { queryParams, setQueryParams } = useQueryParams()

  const deleteModalRef = useRef<ModalHandle>(null)

  const toggleModalRef = useRef<ModalHandle>(null)

  const formDrawerRef = useRef<DrawerHandle>(null)

  const { data, isFetching: isLoadingProductIntefacesList } = useFetch().useQuery('get', '/product-interface', {
    params: {
      query: queryParams
    }
  })

  const { mutateAsync: deleteProductInterface, isPending: isDeletingProductInterface } = useFetch().useMutation(
    'delete',
    '/product-interface/{productInterface}'
  )

  const { mutateAsync: toggleProductInterface, isPending: isTogglingProductInterface } = useFetch().useMutation(
    'post',
    '/product-interface/toggle/{productInterface}'
  )

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const modalTranslate = dictionary.modal

  const columns = useMemo<ColumnDef<WithActions<components['schemas']['ProductInterfaceResource']>, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: keywordsTranslate.title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Image src={row.original.image?.original_url ?? ''} alt={row.original.title} className='rounded-md' />
            <Typography className='font-medium' color='text.primary'>
              {row.original.title}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('category', {
        header: keywordsTranslate.category,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.category?.title}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('type', {
        header: keywordsTranslate.type,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.type?.label}
            </Typography>
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
              href={`${menuUrls.product_management.products.edit}/${row.original.id}`}
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
                setSelectedItem({ id: row.original.id ?? 0, status: 'toggling' })
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
  const handleDeleteProductInterface = async () => {
    await deleteProductInterface({
      params: {
        path: {
          productInterface: selectedItem?.id ?? 0
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
            '/product-interface',
            {
              params: {
                query: queryParams
              }
            }
          ]
        })
      )
  }

  const handleToggleProductInterface = async () => {
    await toggleProductInterface({
      params: {
        path: {
          productInterface: selectedItem?.id ?? 0
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
            '/product-interface',
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
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.products}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.page_limit
          }}
          listTitle={keywordsTranslate.products}
          addFunctionality={() => {
            formDrawerRef.current?.open()
            setSelectedItem({ id: undefined, status: 'adding' })
          }}
          isLoading={isLoadingProductIntefacesList}
        />
        <DeleteModal
          ref={deleteModalRef}
          title={`${keywordsTranslate.delete} ${keywordsTranslate.product}`}
          handleConfirm={handleDeleteProductInterface}
          isLoadingConfirmation={isDeletingProductInterface}
        >
          {translateReplacer(modalTranslate.delete, `${keywordsTranslate.product}`)}
        </DeleteModal>
        <ToggleModal
          ref={toggleModalRef}
          title={`${keywordsTranslate.toggle} ${keywordsTranslate.product}`}
          handleConfirm={handleToggleProductInterface}
          isLoadingConfirmation={isTogglingProductInterface}
        >
          {translateReplacer(modalTranslate.toggle, keywordsTranslate.product)}
        </ToggleModal>
        <ProductForm
          ref={formDrawerRef}
          dictionary={dictionary}
          selectedItem={selectedItem}
          listQueryParams={queryParams}
        />
      </Card>
    </>
  )
}

export default ProductsListTable
