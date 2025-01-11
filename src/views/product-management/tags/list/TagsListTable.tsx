'use client'

// React Imports
import { useMemo, useRef, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { Card, Typography } from '@mui/material'

// Third-party Imports
import qs from 'qs'
import { toast } from 'react-toastify'
import type { ColumnDef } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import { useQueryClient } from '@tanstack/react-query'

// Type Imports
import type { ModalHandle, WithActions } from '@/@core/types'
import type { components } from '@/@core/api/v1'

// Component Imports
import CustomIconButton from '@/@core/components/mui/IconButton'
import DeleteModal from '@/@core/components/modals/DeleteModal'
import type { DrawerHandle } from '@/@core/components/drawers/FormDrawer'
import Table from '@/@core/components/table/Table'
import TagForm from '../components/TagForm'

// Util Imports
import type { getDictionary } from '@/utils/getDictionary'
import { translateReplacer } from '@/utils/translateReplacer'
import { useFetch } from '@/utils/clientRequest'
import { useQueryParams } from '@/@core/hooks/useQueryParams'

const columnHelper = createColumnHelper<WithActions<components['schemas']['TagResource']>>()

type SelectedItem = {
  id: number | undefined
  status: 'editing' | 'deleting' | 'adding'
}

type TagWithActionsType = components['schemas']['TagResource'] & {
  actions?: string
}

const TagsListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // Variables

  const router = useRouter()

  const queryClient = useQueryClient()

  const [selectedItem, setSelectedItem] = useState<SelectedItem>()

  const { queryParams, setQueryParams } = useQueryParams()

  const keywordsTranslate = dictionary?.keywords

  const modalTranslate = dictionary.modal

  const deleteModalRef = useRef<ModalHandle>(null)

  const formDrawerRef = useRef<DrawerHandle>(null)

  const { data, isFetching: isLoadingTagsList } = useFetch().useQuery('get', '/tag', {
    params: {
      query: queryParams
    }
  })

  const { mutateAsync: deleteTag, isPending: isDeletingTag } = useFetch().useMutation('delete', '/tag/{tag}')

  const columns = useMemo<ColumnDef<TagWithActionsType, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: keywordsTranslate.title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.name}
              </Typography>
            </div>
          </div>
        )
      }),

      columnHelper.accessor('type', {
        header: keywordsTranslate.type,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.type?.label ?? '-'}
              </Typography>
            </div>
          </div>
        )
      }),

      columnHelper.accessor('order_column', {
        header: keywordsTranslate.ordering,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.order_column}
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

  const handleDeleteTag = async () => {
    await deleteTag({ params: { path: { tag: selectedItem?.id ?? 0 } } })
      .then(res => {
        toast.success(res.message)

        deleteModalRef.current?.close()

        if (data?.data?.length === 1) {
          setQueryParams(queryParams => ({ ...queryParams, page: (queryParams?.page ?? 0) - 1 }))
          router.push(`?${qs.stringify({ ...queryParams, page: (queryParams?.page ?? 0) - 1 })}`)
        }
      })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [
            'get',
            '/tag',
            {
              params: {
                query: queryParams
              }
            }
          ]
        })
      })
  }

  return (
    <Card>
      <Table
        columns={columns}
        data={data}
        debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.tags}`}
        queryParams={queryParams}
        setQueryParams={setQueryParams}
        pagination={{
          pageIndex: (queryParams?.page ?? 1) - 1,
          pageSize: queryParams?.page_limit
        }}
        listTitle={keywordsTranslate.tags}
        addFunctionality={() => {
          formDrawerRef.current?.open()
          setSelectedItem({ id: undefined, status: 'adding' })
        }}
        isLoading={isLoadingTagsList}
      />
      <DeleteModal
        ref={deleteModalRef}
        title={`${keywordsTranslate.delete} ${keywordsTranslate.tag}`}
        handleConfirm={handleDeleteTag}
        isLoadingConfirmation={isDeletingTag}
      >
        {translateReplacer(modalTranslate.delete, `${keywordsTranslate.tag}`)}
      </DeleteModal>

      <TagForm ref={formDrawerRef} dictionary={dictionary} selectedItem={selectedItem} listQueryParams={queryParams} />
    </Card>
  )
}

export default TagsListTable
