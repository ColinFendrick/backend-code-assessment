import { useState, useEffect } from "react";
import type { NextPage } from "next";

import { useQuery } from "react-query";

import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import InputAdornment from "@mui/material/InputAdornment";

import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid";

import SearchIcon from "@mui/icons-material/Search";

const useDebounce = (value: any, delay = 300) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      /*
        Return a cleanup fn to call every time useEffect is re-called.
        This prevents debouncedValue from changing if value is changed w/in delay.
      */
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call if value or delay changes
  );

  return debouncedValue;
};

async function getLoans(
  page: number = 0,
  pageSize: number = 10,
  search: string = "",
  sortModel: GridSortModel
): Promise<any> {
  const res = await fetch(
    `/api/loans?page=${page}&pageSize=${pageSize}&search=${search}&field=${sortModel[0]?.field}&sort=${sortModel[0]?.sort}`
  );
  return res.json();
}

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 50 },
  { field: "address1", headerName: "Street Address", width: 200 },
  { field: "city", headerName: "City", width: 180 },
  { field: "state", headerName: "State", width: 100 },
  { field: "zipCode", headerName: "Zip Code", width: 100 },
  { field: "companyName", headerName: "Company Name", width: 200 },
  { field: "amount", headerName: "Loan Amount", width: 200 },
  { field: "loanTerm", headerName: "Term", width: 200 },
  { field: "loanRate", headerName: "Interest Rate", width: 200 },
];

const Home: NextPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: "id",
      sort: "asc",
    },
  ]);

  const { data } = useQuery(
    ["loans", page, pageSize, debouncedSearch, sortModel],
    () => getLoans(page, pageSize, debouncedSearch, sortModel)
  );
  const [rows, rowCount] = data ?? [[], 0];

  return (
    <>
      <AppBar position="static">
        <Toolbar>Quanta Code Assessment</Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ pt: 15 }}>
        <TextField
          label="Search"
          placeholder="search by address or company..."
          sx={{ width: 350, marginBottom: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          paginationMode="server"
          sortingMode="server"
          rowCount={rowCount}
          page={page}
          pageSize={rows.length}
          onPageSizeChange={(pageSize) => setPageSize(pageSize)}
          onPageChange={(page) => setPage(page)}
          sortModel={sortModel}
          onSortModelChange={(newSortModel) => {
            if (newSortModel.length === 0)
              setSortModel([{ ...sortModel[0], sort: "asc" }]);
            else setSortModel(newSortModel);
          }}
        />
      </Container>
    </>
  );
};

export default Home;
