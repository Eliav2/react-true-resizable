import {
  MRT_GlobalFilterTextField,
  MRT_TableBodyCellValue,
  MRT_TablePagination,
  MRT_ToolbarAlertBanner,
  flexRender,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { type Person, data } from "./makeData";
import ResizableExpr, { NewResizableProps, ResizableRefHandle } from "../../../../../src/experamintal/Resizable";

const columns: MRT_ColumnDef<Person>[] = [
  {
    accessorKey: "name.firstName",
    header: "First Name",
  },
  {
    accessorKey: "name.lastName",
    header: "Last Name",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "state",
    header: "State",
  },
];

const MrtCustomHeadless = () => {
  const table = useMaterialReactTable({
    columns,
    data, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    //MRT display columns can still work, optionally override cell renders with `displayColumnDefOptions`
    enableRowSelection: true,
    initialState: {
      pagination: { pageSize: 5, pageIndex: 0 },
      showGlobalFilter: true,
    },
    //customize the MRT components
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 15],
      variant: "outlined",
    },
    paginationDisplayMode: "pages",
  });

  return (
    <Stack sx={{ m: "2rem 0" }}>
      <Typography variant="h4">My Custom Headless Table</Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/**
         * Use MRT components along side your own markup.
         * They just need the `table` instance passed as a prop to work!
         */}
        <MRT_GlobalFilterTextField table={table} />
        <MRT_TablePagination table={table} />
      </Box>
      {/* Using Vanilla Material-UI Table components here */}
      <TableContainer>
        <Table>
          {/* Use your own markup, customize however you want using the power of TanStack Table */}
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <ResizableExpr
                    enabledHandles={["right", "bottom"]}
                    HandlesProps={{ resizeRatio: 2, style: {} }}
                    HandleProps={{ bottom: { resizeRatio: 1 } }}
                  >
                    <TableCell align="center" variant="head" key={header.id} sx={{ border: "1px solid gray" }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.Header ?? header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  </ResizableExpr>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} selected={row.getIsSelected()}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell align="center" variant="body" key={cell.id} sx={{ border: "1px solid gray" }}>
                    {/* Use MRT's cell renderer that provides better logic than flexRender */}
                    <MRT_TableBodyCellValue cell={cell} table={table} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
    </Stack>
  );
};

export default MrtCustomHeadless;
