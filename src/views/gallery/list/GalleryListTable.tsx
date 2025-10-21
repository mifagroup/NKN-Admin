'use client'

// React Imports
import { useMemo, useRef } from 'react'

// Third-party Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { useQueryClient } from '@tanstack/react-query'

// Type Imports
import type { components } from '@/@core/api/v1'
import type { getDictionary } from '@/utils/getDictionary'
import type { WithActions } from '@/@core/types'

// Hook Imports
import { useFetch } from '@/utils/clientRequest'
import { useQueryParams } from '@/@core/hooks/useQueryParams'

// Component Imports
import Table from '@/@core/components/table/Table'
import CustomIconButton from '@/@core/components/mui/IconButton'
import EditMediaModal from '../components/EditMediaModal'

// Column Definitions
const columnHelper = createColumnHelper<WithActions<components['schemas']['FileResource']>>()

const GalleryListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // Refs
  const editMediaModalRef = useRef<any>(null)

  // Hooks
  const { queryParams, setQueryParams } = useQueryParams()

  const { data, isFetching: isLoadingMediaList } = useFetch().useQuery('get', '/media', {
    params: {
      query: {
        ...queryParams
      }
    }
  })

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const columns = useMemo<ColumnDef<WithActions<components['schemas']['FileResource']>, any>[]>(
    () => [
      columnHelper.accessor('url', {
        header: keywordsTranslate.image || 'Image',
        cell: ({ row }) => (
          <Box
            component='img'
            src={row.original.original_url}
            alt={row.original.alt || row.original.file_name}
            sx={{
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius: 1
            }}
          />
        )
      }),
      columnHelper.accessor('file_name', {
        header: keywordsTranslate.file_name || 'File Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.file_name}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('alt', {
        header: keywordsTranslate.alt || 'Alt Text',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original.alt || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('mime_type', {
        header: keywordsTranslate.type || 'Type',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original.extension}
          </Typography>
        )
      }),
      columnHelper.accessor('size', {
        header: keywordsTranslate.size || 'Size',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original.size ? `${(parseInt(row.original.size) / 1024).toFixed(2)} KB` : '-'}
          </Typography>
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
                editMediaModalRef.current?.open(row.original)
              }}
            >
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
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
  const handleMediaUpdated = () => {
    queryClient.invalidateQueries({
      queryKey: ['get', '/media']
    })
  }

  return (
    <>
      <Card>
        <Table
          columns={columns}
          data={data}
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.media || 'Media'}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.per_page
          }}
          listTitle={keywordsTranslate.media || 'Media'}
          isLoading={isLoadingMediaList}
        />
      </Card>

      <EditMediaModal
        ref={editMediaModalRef}
        dictionary={dictionary}
        onSuccess={handleMediaUpdated}
      />
    </>
  )
}

export default GalleryListTable
