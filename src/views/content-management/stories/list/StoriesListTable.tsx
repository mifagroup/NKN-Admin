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
import type { WithActions, ModalHandle, ThemeColor, ImageMimeType, VideoMimeType } from '@/@core/types'
import ToggleModal from '@/@core/components/modals/ToggleModal'
import { menuUrls } from '@/@menu/utils/menuUrls'
import Image from '@/@core/components/image'
import Video from '@/@core/components/video'
import { validImageMimeTypes, validVideoMimeTypes } from '@/configs/mediaMimeTypes'

// Column Definitions
const columnHelper = createColumnHelper<WithActions<components['schemas']['StoryResource']>>()

const StoriesListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // States
  const [selectedItem, setSelectedItem] = useState<{
    id: number | undefined
    status: 'deleting' | 'toggling'
  }>()

  // Hooks

  const router = useRouter()

  const { queryParams, setQueryParams } = useQueryParams()

  const deleteModalRef = useRef<ModalHandle>(null)

  const toggleModalRef = useRef<ModalHandle>(null)

  const { data, isFetching: isLoadingStoriesList } = useFetch().useQuery('get', '/story', {
    params: {
      query: queryParams
    }
  })

  const { mutateAsync: deleteStory, isPending: isDeletingStory } = useFetch().useMutation('delete', '/story/{story}')

  const { mutateAsync: toggleStory, isPending: isTogglingStory } = useFetch().useMutation(
    'post',
    '/story/toggle/{story}'
  )

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const modalTranslate = dictionary.modal

  const columns = useMemo<ColumnDef<WithActions<components['schemas']['StoryResource']>, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: keywordsTranslate.title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {validImageMimeTypes?.includes(row.original.media?.mime_type as ImageMimeType) ? (
              <Image src={row.original.media?.original_url ?? ''} alt={row.original.title} className='rounded-md' />
            ) : validVideoMimeTypes?.includes(row.original.media?.mime_type as VideoMimeType) ? (
              <Video
                preview={row.original.media?.original_url ?? ''}
                src={row.original.media?.original_url ?? ''}
                className='rounded-md'
              />
            ) : null}
            <Typography className='font-medium' color='text.primary'>
              {row.original.title}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('type', {
        header: keywordsTranslate.type,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.type?.label}
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
              href={menuUrls.content_management.story.edit.replace(':id', row.original.id.toString())}
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
  const handleDeleteStory = async () => {
    await deleteStory({
      params: {
        path: {
          story: selectedItem?.id ?? 0
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
            '/story',
            {
              params: {
                query: queryParams
              }
            }
          ]
        })
      )
  }

  const handleToggleStory = async () => {
    await toggleStory({
      params: {
        path: {
          story: selectedItem?.id ?? 0
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
            '/story',
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
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.stories}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.per_page
          }}
          listTitle={keywordsTranslate.stories}
          addUrl={menuUrls.content_management.story.add}
          isLoading={isLoadingStoriesList}
        />
        <DeleteModal
          ref={deleteModalRef}
          title={`${keywordsTranslate.delete} ${keywordsTranslate.story}`}
          handleConfirm={handleDeleteStory}
          isLoadingConfirmation={isDeletingStory}
        >
          {translateReplacer(modalTranslate.delete, `${keywordsTranslate.story}`)}
        </DeleteModal>
        <ToggleModal
          ref={toggleModalRef}
          title={`${keywordsTranslate.toggle} ${keywordsTranslate.story}`}
          handleConfirm={handleToggleStory}
          isLoadingConfirmation={isTogglingStory}
        >
          {translateReplacer(modalTranslate.toggle, keywordsTranslate.story)}
        </ToggleModal>
      </Card>
    </>
  )
}

export default StoriesListTable
