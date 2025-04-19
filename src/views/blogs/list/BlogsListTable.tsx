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
import { useMe } from '@/@core/hooks/useMe'

type BlogWithActionsType = components['schemas']['BlogResource'] & {
  actions?: string
}

// Column Definitions
const columnHelper = createColumnHelper<BlogWithActionsType>()

const BlogsListTable = ({
  dictionary,
  type
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  type: string
}) => {
  // States
  const [selectedItemId, setSelectedItemId] = useState<string>()

  // Hooks

  const router = useRouter()

  const { queryParams, setQueryParams } = useQueryParams()

  const deleteModalRef = useRef<ModalHandle>(null)

  const { data: authData } = useMe()

  const isDoctor = authData?.data?.role[0] === 'DOC'

  const { data, isFetching: isLoadingBlogsList } = useFetch().useQuery('get', '/blogs', {
    params: {
      query: {
        ...queryParams,
        'filter[type]': type,
        'filter[user_id]': isDoctor ? authData?.data?.id : undefined
      }
    }
  })

  const { mutateAsync: deleteBlog, isPending: isDeletingBlog } = useFetch().useMutation('delete', '/blogs/{slug}')

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const modalTranslate = dictionary.modal

  const columns = useMemo<ColumnDef<BlogWithActionsType, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: keywordsTranslate.title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Image
              src={row.original.main_image?.original_url ?? ''}
              alt='blog-image'
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
      columnHelper.accessor('sub_title', {
        header: keywordsTranslate.sub_title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Typography color='text.primary'>{row.original.sub_title}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('duration', {
        header: keywordsTranslate.duration,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.duration} {keywordsTranslate.minute}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('slug', {
        header: keywordsTranslate.slug,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.slug}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('actions', {
        header: keywordsTranslate.actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <CustomIconButton size='small' title={keywordsTranslate.edit}>
              <Link className='flex' href={`${menuUrls.blogs.edit}/${row.original.slug}`}>
                <i className='ri-edit-box-line text-[22px] text-textSecondary' />
              </Link>
            </CustomIconButton>
            <CustomIconButton
              size='small'
              title={keywordsTranslate.delete}
              onClick={() => {
                setSelectedItemId(row.original.slug)

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
  const handleDeleteBlog = async () => {
    await deleteBlog({
      params: {
        path: {
          slug: selectedItemId ?? ''
        }
      }
    })
      .then(res => {
        // @ts-ignore
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
            '/blogs',
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
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.blog}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.per_page
          }}
          listTitle={keywordsTranslate.blogs}
          addUrl={menuUrls.blogs.add}
          isLoading={isLoadingBlogsList}
        />
        <DeleteModal
          ref={deleteModalRef}
          title={`${keywordsTranslate.delete} ${keywordsTranslate.blog}`}
          handleConfirm={handleDeleteBlog}
          isLoadingConfirmation={isDeletingBlog}
        >
          {translateReplacer(modalTranslate.delete, keywordsTranslate.blog)}
        </DeleteModal>
      </Card>
    </>
  )
}

export default BlogsListTable
