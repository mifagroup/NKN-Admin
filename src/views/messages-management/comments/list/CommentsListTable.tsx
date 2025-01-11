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
import CommentForm from '../components/CommentForm'
import CommentReplyForm from '../components/CommentReplyForm'

// Column Definitions
const columnHelper = createColumnHelper<WithActions<components['schemas']['CommentResource']>>()

const CommentsListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // States
  const [selectedItem, setSelectedItem] = useState<{
    id: number | undefined
    status: 'editing' | 'deleting' | 'toggling' | 'replying'
  }>()

  // Hooks

  const router = useRouter()

  const { queryParams, setQueryParams } = useQueryParams()

  const deleteModalRef = useRef<ModalHandle>(null)

  const toggleModalRef = useRef<ModalHandle>(null)

  const formDrawerRef = useRef<DrawerHandle>(null)

  const formReplyDrawerRef = useRef<DrawerHandle>(null)

  const { data, isFetching: isLoadingCommentList } = useFetch().useQuery('get', '/comment', {
    params: {
      query: queryParams
    }
  })

  const { mutateAsync: deleteComment, isPending: isDeletingComment } = useFetch().useMutation(
    'delete',
    '/comment/{comment}'
  )

  const { mutateAsync: toggleComment, isPending: isTogglingComment } = useFetch().useMutation(
    'post',
    '/comment/toggle/{comment}'
  )

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const modalTranslate = dictionary.modal

  const columns = useMemo<ColumnDef<WithActions<components['schemas']['CommentResource']>, any>[]>(
    () => [
      columnHelper.accessor('comment', {
        header: keywordsTranslate.comment,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary' title={row.original.comment}>
                {row.original.comment}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('user', {
        header: keywordsTranslate.user,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.user?.name}
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
            <CustomIconButton
              size='small'
              title={keywordsTranslate.reply}
              onClick={() => {
                formReplyDrawerRef.current?.open()
                setSelectedItem({ id: row.original.id ?? 0, status: 'replying' })
              }}
            >
              <i className='ri-chat-1-line text-[22px] text-textSecondary' />
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
  const handleDeleteComment = async () => {
    await deleteComment({
      params: {
        path: {
          comment: selectedItem?.id ?? 0
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
            '/comment',
            {
              params: {
                query: queryParams
              }
            }
          ]
        })
      )
  }

  const handleToggleComment = async () => {
    await toggleComment({
      params: {
        path: {
          comment: selectedItem?.id ?? 0
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
            '/comment',
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
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.comment}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.page_limit
          }}
          listTitle={keywordsTranslate.comments}
          isLoading={isLoadingCommentList}
        />
        <DeleteModal
          ref={deleteModalRef}
          title={`${keywordsTranslate.delete} ${keywordsTranslate.comment}`}
          handleConfirm={handleDeleteComment}
          isLoadingConfirmation={isDeletingComment}
        >
          {translateReplacer(modalTranslate.delete, `${keywordsTranslate.comment}`)}
        </DeleteModal>
        <ToggleModal
          ref={toggleModalRef}
          title={`${keywordsTranslate.toggle} ${keywordsTranslate.comment}`}
          handleConfirm={handleToggleComment}
          isLoadingConfirmation={isTogglingComment}
        >
          {translateReplacer(modalTranslate.toggle, keywordsTranslate.comment)}
        </ToggleModal>
        <CommentForm
          ref={formDrawerRef}
          dictionary={dictionary}
          selectedItem={selectedItem}
          listQueryParams={queryParams}
        />
        <CommentReplyForm
          ref={formReplyDrawerRef}
          dictionary={dictionary}
          selectedItem={selectedItem}
          listQueryParams={queryParams}
        />
      </Card>
    </>
  )
}

export default CommentsListTable
