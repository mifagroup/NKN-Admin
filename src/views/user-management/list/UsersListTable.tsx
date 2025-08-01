'use client'

// React Imports
import { useMemo, useRef, useState } from 'react'

// Third-party Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { useQueryClient } from '@tanstack/react-query'

// Util Imports
import { toast } from 'react-toastify'

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

// Column Definitions
const columnHelper = createColumnHelper<WithActions<components['schemas']['UserResource']>>()

const UsersListTable = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // States
  const [selectedItemId, setSelectedItemId] = useState<number>()

  // Hooks
  const { queryParams, setQueryParams } = useQueryParams()
  const deleteModalRef = useRef<ModalHandle>(null)

  const { data, isFetching: isLoadingUsersList } = useFetch().useQuery('get', '/users')

  const { mutateAsync: deleteUser, isPending: isDeletingUser } = useFetch().useMutation('delete', '/users/{id}')

  const queryClient = useQueryClient()

  // Vars
  const keywordsTranslate = dictionary.keywords
  const modalTranslate = dictionary.modal
  const messagesTranslate = (dictionary as any).messages
  const fieldsTranslate = (dictionary as any).fields

  const columns = useMemo<ColumnDef<WithActions<components['schemas']['UserResource']>, any>[]>(
    () => [
      columnHelper.accessor('full_name', {
        header: keywordsTranslate.title,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.full_name || `${row.original.first_name} ${row.original.last_name}`}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {row.original.email}
              </Typography>
            </div>
          </div>
        )
      }),

      columnHelper.accessor('role', {
        header: fieldsTranslate.role,
        cell: ({ row }) => (
          <Typography>
            {row.original.role && Array.isArray(row.original.role) && row.original.role.length > 0 
              ? row.original.role.join(', ') 
              : 'N/A'
            }
          </Typography>
        )
      }),

      columnHelper.accessor('actions', {
        header: keywordsTranslate.actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <CustomIconButton size='small' title={keywordsTranslate.edit}>
              <Link className='flex' href={`${menuUrls.user_management.users.edit}/${row.original.id}`}>
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
  const handleDeleteUser = async () => {
    await deleteUser({
      params: {
        path: {
          id: selectedItemId ?? 0
        }
      }
    })
      .then(() => {
        toast.success((dictionary as any).messages.user_deleted_successfully)
        deleteModalRef.current?.close()
      })
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: ['get', '/users']
        })
      )
  }

  return (
    <>
      <Card>
        <Table
          columns={columns}
          data={data}
          debouncedInputPlaceholder={`${keywordsTranslate.search} ${keywordsTranslate.users}`}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
          pagination={{
            pageIndex: (queryParams?.page ?? 1) - 1,
            pageSize: queryParams?.per_page
          }}
          listTitle={keywordsTranslate.users}
          addUrl={menuUrls.user_management.users.add}
          isLoading={isLoadingUsersList}
        />
        <DeleteModal
          ref={deleteModalRef}
          title={`${keywordsTranslate.delete} ${keywordsTranslate.user}`}
          handleConfirm={handleDeleteUser}
          isLoadingConfirmation={isDeletingUser}
        >
          {translateReplacer(modalTranslate.delete, keywordsTranslate.user)}
        </DeleteModal>
      </Card>
    </>
  )
}

export default UsersListTable 
 