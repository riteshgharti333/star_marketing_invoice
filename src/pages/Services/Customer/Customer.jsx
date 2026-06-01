import "./Customer.scss";

import { Plus, Search } from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import Select from "react-select";
import { Link, useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import NewCustomer from "../../../components/NewCustomer/NewCustomer";
import CardCustomer from "../../../components/CardCustomer/CardCustomer";
import { baseUrl } from "../../../main";

import axios from "axios";

const weekOptions = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
];

const customStyles = {
  control: (base) => ({
    ...base,
    borderRadius: "5px",
    padding: "2px 4px",
    borderColor: "#ccc",
    boxShadow: "none",
    cursor: "pointer",
    fontSize: "14px",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: "0",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#007bff"
      : state.isFocused
        ? "#e6f0ff"
        : "#fff",
    color: state.isSelected ? "#fff" : "#333",
    padding: "8px 12px",
  }),
};

const Customer = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");

  const [openCustomerCard, setOpenCustomerCard] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [selectedRange, setSelectedRange] = useState(weekOptions[1]);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/customer/all-customers`);
        const customerList = response.data.customers;

        // Fetch all invoices for each customer
        const customerWithBalance = await Promise.all(
          customerList.map(async (customer) => {
            let closingBalance = 0;

            if (customer.invoiceId?.length) {
              const invoiceResponses = await Promise.all(
                customer.invoiceId.map((id) =>
                  axios.get(`${baseUrl}/invoice/${id}`),
                ),
              );

              closingBalance = invoiceResponses.reduce(
                (acc, res) => acc + (res.data.invoice?.amountBalance || 0),
                0,
              );
            }

            return {
              ...customer,
              closingBalance,
            };
          }),
        );

        setCustomers(customerWithBalance);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const getAllInvoices = async () => {
      try {
        const invoicePromises = customers.invoiceId.map((id) =>
          axios.get(`${baseUrl}/invoice/${id}`),
        );

        const responses = await Promise.all(invoicePromises);
        const invoices = responses.map((res) => res.data.invoice);

        setInvoiceIdData(invoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    if (customers?.invoiceId?.length) {
      getAllInvoices();
    }
  }, [customers]);

  const handleWeekChange = (option) => {
    setSelectedRange(option);
    // Optional: apply filtering logic here
    console.log("Filter by:", option.value);
  };

  const filteredData = useMemo(() => {
    if (activeFilter === "All") return customers;
    return customers.filter((item) => item.status === activeFilter);
  }, [activeFilter, customers]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "phone",
        header: "Phone Number",
        cell: (info) => info.getValue(),
      },

      {
        accessorKey: "closingBalance",
        header: "Closing Balance",
        cell: (info) => `₹${info.getValue()?.toFixed(2) || 0}`,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: (info) => {
          const date = new Date(info.getValue());
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
  });

  const handleRowClick = (customer) => {
    setOpenCustomerCard(true);
    setSelectedInvoice(customer);
  };

  const [openCustomer, setOpenCustomer] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="customer">
      {openCustomer && <NewCustomer setOpenCustomer={setOpenCustomer} />}

      {openCustomerCard && (
        <CardCustomer
          setOpenCustomerCard={setOpenCustomerCard}
          customer={selectedInvoice}
        />
      )}
      <div className="customer-top">
        <h1>Customers</h1>
        <button className="primary-btn" onClick={() => setOpenCustomer(true)}>
          <Plus size={20} /> New Customer
        </button>
      </div>

      <div className="customer-content">
        <div className="customer-content-items">
          <span className="active-filter">All Customers</span>
        </div>
        {/* 
        <div className="customer-content-inputs">
          <div className="customer-content-inputs-search">
            <Search className="search-icon" />
            <input type="search" placeholder="search by customer..." />
          </div>
          <div className="customer-content-inputs-week">
            <Select
              options={weekOptions}
              value={selectedRange}
              onChange={handleWeekChange}
              styles={customStyles}
              isSearchable={false}
              components={{
                DropdownIndicator: () => (
                  <IoIosArrowDown size={18} color="#555" />
                ),
              }}
            />
          </div>
        </div> */}
      </div>

      <div className="customer-sm">
        <div className="customer-sm-items">
          {filteredData.map((item, index) => (
            <div
              className="customer-sm-item"
              key={index}
              onClick={() => {
                setOpenCustomerCard(true);
                setSelectedInvoice(item);
              }}
            >
              <div className="customer-sm-item-left">
                <p>{item.name}</p>
                <span>{item.phone}</span>
              </div>

              <div className="customer-sm-item-right">
                <span>Closing Balance</span>
                <p>₹{item.closingBalance}</p>
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="customer-table">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {header.column.getIsSorted() === "asc"
                      ? " 🔼"
                      : header.column.getIsSorted() === "desc"
                        ? " 🔽"
                        : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => handleRowClick(row.original)}
                style={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-bottom">
          <div className="table-bottom-desc">
            <div className="table-bottom-desc-item">
              <span>You Pay</span>
              <span>₹0.00</span>
            </div>
            <div className="table-bottom-desc-item">
              <span>Your Collect</span>
              <span>₹0.00</span>
            </div>
          </div>

          <div className="customer-pagination">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              First
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ◀ Prev
            </button>
            <span className="page">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next ▶
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customer;
