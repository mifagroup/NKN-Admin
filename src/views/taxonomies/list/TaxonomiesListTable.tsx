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
const columnHelper = createColumnHelper<WithActions<components['schemas']['TaxonomyResource']>>()

const TaxonomiesListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // States
  const [selectedItemId, setSelectedItemId] = useState<number>()

  // Hooks

  const { queryParams, setQueryParams } = useQueryParams()

  const router = useRouter()

  const deleteModalRef = useRef<ModalHandle>(null)

  const { data, isFetching: isLoadingTaxonomiesList } = useFetch().useQuery('get', '/taxonomies', {})

  // const { mutateAsync: deleteTaxonomy, isPending: isDeletingTaxonomy } = useFetch().useMutation(
  //   'delete',
  //   '/hospitals/{id}'
  // )

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const modalTranslate = dictionary.modal

  const columns = useMemo<ColumnDef<WithActions<components['schemas']['TaxonomyResource']>, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: keywordsTranslate.title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.title}
            </Typography>
          </div>
        )
      }),

      columnHelper.accessor('actions', {
        header: keywordsTranslate.actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
            {/* <CustomIconButton size='small' title={keywordsTranslate.edit}>
              <Link className='flex' href={`${menuUrls.hospitals.edit}/${row.original.id}`}>
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
            </CustomIconButton> */}
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  // Functions
  // const handleDeleteHospital = async () => {
  //   await deleteHospital({
  //     params: {
  //       path: {
  //         id: selectedItemId ?? 0
  //       }
  //     }
  //   })
  //     .then(res => {
  //       toast.success(res.message)

  //       deleteModalRef.current?.close()
  //     })
  //     .then(() =>
  //       queryClient.invalidateQueries({
  //         queryKey: ['get', '/hospitals']
  //       })
  //     )
  // }

  return (
    <>
      <Card>
        <Table
          columns={columns}
          data={data}
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.taxonomies}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.per_page
          }}
          listTitle={keywordsTranslate.taxonomies}
          // addUrl={menuUrls.hospitals.add}
          isLoading={isLoadingTaxonomiesList}
        />
        {/* <DeleteModal
          ref={deleteModalRef}
          title={`${keywordsTranslate.delete} ${keywordsTranslate.hospital}`}
          handleConfirm={handleDeleteHospital}
          isLoadingConfirmation={isDeletingHospital}
        >
          {translateReplacer(modalTranslate.delete, keywordsTranslate.hospital)}
        </DeleteModal> */}
      </Card>
    </>
  )
}

export default TaxonomiesListTable
