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
import { menuUrls } from '@/@menu/utils/menuUrls'
import Link from '@/components/Link'
import CustomIconButton from '@/@core/components/mui/IconButton'
import { translateReplacer } from '@/utils/translateReplacer'
import type { WithActions, ModalHandle } from '@/@core/types'
import Image from '@/@core/components/image'

// Column Definitions
const columnHelper = createColumnHelper<WithActions<any>>()

const InsuranceListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // States
  const [selectedItemId, setSelectedItemId] = useState<number>()

  // Hooks
  const { queryParams, setQueryParams } = useQueryParams()

  const deleteModalRef = useRef<ModalHandle>(null)

  const { data, isFetching: isLoadingInsurancesList } = useFetch().useQuery('get', '/insurances', {
    params: {
      // query: {
      //   ...queryParams
      // }
    }
  })

  const { mutateAsync: deleteInsurance, isPending: isDeletingInsurance } = useFetch().useMutation(
    'delete',
    '/insurances/{id}'
  )

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords

  const modalTranslate = dictionary.modal

  const columns = useMemo<ColumnDef<WithActions<any>, any>[]>(
    () => [
      columnHelper.accessor('title', {
        header: keywordsTranslate.title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Image
              src={row.original.logo?.original_url ?? ''}
              alt='insurance-logo'
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
      columnHelper.accessor('hospitals', {
        header: keywordsTranslate.hospitals,
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-2'>
            {row.original.hospitals?.length > 0 ? (
              row.original.hospitals.map((hospital: any) => (
                <Chip key={hospital.id} label={hospital.name} size='small' variant='outlined' />
              ))
            ) : (
              <Typography variant='body2' color='text.secondary'>
                -
              </Typography>
            )}
          </div>
        )
      }),

      columnHelper.accessor('actions', {
        header: keywordsTranslate.actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <CustomIconButton size='small' title={keywordsTranslate.edit}>
              <Link className='flex' href={`${menuUrls.insurances.edit}/${row.original.id}`}>
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
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  // Functions
  const handleDeleteInsurance = async () => {
    await deleteInsurance({
      params: {
        path: {
          id: selectedItemId ?? 0
        }
      }
    })
      .then(res => {
        toast.success((dictionary as any).messages.insurance_deleted_successfully)

        deleteModalRef.current?.close()
      })
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: ['get', '/insurances']
        })
      )
  }

  return (
    <>
      <Card>
        <Table
          columns={columns}
          data={data}
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.insurances}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.per_page
          }}
          listTitle={keywordsTranslate.insurances}
          addUrl={menuUrls.insurances.add}
          isLoading={isLoadingInsurancesList}
        />
        <DeleteModal
          ref={deleteModalRef}
          title={`${keywordsTranslate.delete} ${keywordsTranslate.insurance}`}
          handleConfirm={handleDeleteInsurance}
          isLoadingConfirmation={isDeletingInsurance}
        >
          {translateReplacer(modalTranslate.delete, keywordsTranslate.insurance)}
        </DeleteModal>
      </Card>
    </>
  )
}

export default InsuranceListTable
