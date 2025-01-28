'use client'

// React Imports
import { useMemo, useRef, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Link from 'next/link'

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
import type { getDictionary } from '@/utils/getDictionary'
import Table from '@/@core/components/table/Table'
import { useFetch } from '@/utils/clientRequest'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import CustomIconButton from '@/@core/components/mui/IconButton'
import { type DrawerHandle } from '@/@core/components/drawers/FormDrawer'
import type { WithActions, ModalHandle, ThemeColor } from '@/@core/types'
import { menuUrls } from '@/@menu/utils/menuUrls'

// Column Definitions
const columnHelper = createColumnHelper<WithActions<components['schemas']['SliderResource']>>()

const SlidersListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // States
  const [selectedItem, setSelectedItem] = useState<{
    id: number | undefined
    status: 'editing'
  }>()

  // Hooks

  const router = useRouter()

  const { queryParams, setQueryParams } = useQueryParams()

  const { data, isFetching: isLoadingSliderList } = useFetch().useQuery('get', '/sliders', {
    params: {
      query: queryParams
    }
  })

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const columns = useMemo<ColumnDef<WithActions<components['schemas']['SliderResource']>, any>[]>(
    () => [
      columnHelper.accessor('name', {
        header: keywordsTranslate.title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.key === 'MAIN_SLIDER'
                  ? 'اسلایدر اول صفحه اصلی'
                  : row.original.key === 'SECTION_TWO'
                    ? 'اسلایدر دوم صفحه اصلی'
                    : row.original.key === 'SECTION_THREE'
                      ? 'اسلایدر سوم صفحه اصلی'
                      : ''}
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
              <Link className='flex' href={`${menuUrls.sliders.edit}/${row.original.id}`}>
                <i className='ri-edit-box-line text-[22px] text-textSecondary' />
              </Link>
            </CustomIconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  return (
    <>
      <Card>
        <Table columns={columns} data={data} listTitle={keywordsTranslate.sliders} isLoading={isLoadingSliderList} />
      </Card>
    </>
  )
}

export default SlidersListTable
