// React Imports
import React, { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// third-party imports
import qs from 'qs'
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  TablePagination,
  Typography
} from '@mui/material'
import classNames from 'classnames'
import {
  type ColumnDef,
  type FilterFn,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import DebouncedInput from '../custom-inputs/DebouncedInput'

// Type Imports
import type { components } from '@/@core/api/v1'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@/configs/i18n'

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

type TableProps<T> = {
  // debouncedInputPlaceholder: string
  headerActions?: React.ReactNode
  data:
    | {
        data?: T[]
      }
    | undefined
  columns: ColumnDef<any, any>[]

  // rowSelection: {}
  // setRowSelection: Dispatch<SetStateAction<{}>>
  pagination: Partial<PaginationState> | undefined

  // queryParams: Partial<components['parameters']>
  // setQueryParams: Dispatch<SetStateAction<Partial<components['parameters']>>>
  listTitle: string
  addFunctionality?: React.MouseEventHandler<HTMLButtonElement> | undefined
  addUrl?: string
  isLoading?: boolean
}

const Table = <T,>({
  // debouncedInputPlaceholder,
  headerActions,
  data,
  columns,
  isLoading = false,

  // rowSelection,
  // setRowSelection,
  pagination,

  // queryParams,
  // setQueryParams,
  listTitle,
  addFunctionality,
  addUrl
}: TableProps<T>) => {
  // States
  const [dictionary, setDictionary] = useState<Awaited<ReturnType<typeof getDictionary>>>()

  // Vars
  const keywordsTranslate = dictionary?.keywords

  const tableTranslate = dictionary?.table

  const dataSource = data?.data

  // Hooks
  const { lang } = useParams()

  const router = useRouter()

  useEffect(() => {
    getDictionary(lang as Locale).then(dic => setDictionary(dic))
  }, [lang])

  const table = useReactTable({
    data: dataSource as T[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },

    state: {
      // rowSelection,
      // globalFilter: queryParams.filter?.search,
      pagination: pagination as PaginationState
    },
    initialState: {
      pagination
    },

    // pageCount: data?.meta?.last_page,
    // rowCount: data?.meta?.total,
    manualPagination: true,

    // enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,

    // onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  // Functions
  // const handleDebounceInputChange = (value: string) => {
  //   setQueryParams(prevState => ({
  //     ...prevState,
  //     page: 1,
  //     filter: {
  //       ...prevState.filter,
  //       search: value
  //     }
  //   }))

  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { page, filter, ...rest } = queryParams

  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { search, ...restFilter } = queryParams.filter ?? {}

  //   router.push(`?${qs.stringify({ page: 1, filter: { ...restFilter, search: value }, ...rest })}`)
  // }

  // const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   table?.setPageSize(Number(e.target.value))
  //   setQueryParams(prevState => ({
  //     ...prevState,
  //     page: 1,
  //     page_limit: Number(e.target.value)
  //   }))

  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { page_limit, page, ...rest } = queryParams

  //   router.push(`?${qs.stringify({ page_limit: Number(e.target.value), page: 1, ...rest })}`)
  // }

  // const handleChangePage = (_: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) => {
  //   table?.setPageIndex(newPage)
  //   setQueryParams(prevState => ({
  //     ...prevState,
  //     page: newPage + 1
  //   }))

  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   const { page, ...rest } = queryParams

  //   router.push(`?${qs.stringify({ page: newPage + 1, ...rest })}`)
  // }

  if (!dictionary) {
    return <LinearProgress />
  }

  return (
    <div>
      <div className='p-5 flex justify-between items-center'>
        <Typography variant='h6' fontWeight='700'>
          {keywordsTranslate?.list} {listTitle}
        </Typography>
        <div className='flex items-center gap-x-3'>
          {addFunctionality ? (
            <Button variant='contained' onClick={addFunctionality}>
              {keywordsTranslate?.add}
            </Button>
          ) : null}
          {addUrl ? (
            <Button variant='contained' LinkComponent={Link} href={`/${lang}${addUrl}`}>
              {keywordsTranslate?.add}
            </Button>
          ) : null}
        </div>
      </div>
      <Divider />
      <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
        {/* <DebouncedInput
          value={queryParams.filter?.search ?? ''}
          onChange={handleDebounceInputChange}
          placeholder={debouncedInputPlaceholder}
          className='max-sm:is-full'
        /> */}
        {/* <div className='flex md:items-center items-end max-sm:flex-col gap-4 max-sm:is-full is-auto'>
          <IconButton color='primary' className='is-auto'>
            <i className='ri-settings-2-line' />
          </IconButton>
          {headerActions}
        </div> */}
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          {!dataSource || isLoading ? (
            <div className='flex justify-center py-5'>
              <CircularProgress />
            </div>
          ) : (
            <>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <th key={header.id} style={{ width: `${header.getSize()}px` }}>
                          {header.isPlaceholder ? null : (
                            <>
                              <div
                                className={classNames({
                                  'flex items-center': header.column.getIsSorted(),
                                  'cursor-pointer select-none': header.column.getCanSort()
                                })}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {{
                                  asc: <i className='ri-arrow-up-s-line text-xl' />,
                                  desc: <i className='ri-arrow-down-s-line text-xl' />
                                }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                              </div>
                            </>
                          )}
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
              {table.getFilteredRowModel()?.rows?.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                      {keywordsTranslate?.noDataAvailable}
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table
                    .getRowModel()
                    .rows // .slice(0, table.getState().pagination.pageSize)
                    .map(row => {
                      return (
                        <tr key={row.id} className={classNames({ selected: row.getIsSelected() })}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      )
                    })}
                </tbody>
              )}
            </>
          )}
        </table>
      </div>
      {/* {dataSource?.length ? (
        <TablePagination
          rowsPerPageOptions={
            [10, 25, 50].includes(+(queryParams?.page_limit ?? 0))
              ? [10, 25, 50]
              : [10, 25, 50, +(queryParams?.page_limit ?? 0)]
          }
          labelRowsPerPage={tableTranslate?.rowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            `${from} ${keywordsTranslate?.to} ${to} ${keywordsTranslate?.from} ${count}`
          }
          component='div'
          className='border-bs'
          count={table?.getRowCount()}
          rowsPerPage={table?.getState().pagination.pageSize}
          page={table?.getState().pagination.pageIndex}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      ) : null} */}
    </div>
  )
}

export default Table
