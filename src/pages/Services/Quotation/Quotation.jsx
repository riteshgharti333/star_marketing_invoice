import "./Quotation.scss";
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
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import CardInvoice from "../../../components/CardInvoice/CardInvoice";
import axios from "axios";
import { baseUrl } from "../../../main";
import { BsThreeDots } from "react-icons/bs";
import { reportData } from "../../../assets/data";
import { toast } from "sonner";
import { FaRegTrashAlt } from "react-icons/fa";

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

const Quotation = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [openInvoiceCard, setOpenInvoiceCard] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceData, setInvoiceData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const getAllInvoice = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/quotation/all-quotations`);
        if (data && data.quotation) {
          setInvoiceData(data.quotation);
        }
      } catch (error) {
        console.error("Error fetching quotation:", error);
      }
    };
    getAllInvoice();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".actions-dropdown")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const filteredData = useMemo(() => {
    let result = invoiceData;

    // Apply status filter
    if (activeFilter !== "All") {
      result = result.filter((item) => {
        const payment = item.payments?.[0];
        const paymentStatus = payment
          ? payment.isFullyPaid
            ? "Paid"
            : "Pending"
          : "Pending";
        return paymentStatus === activeFilter;
      });
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((invoice) => {
        return (
          invoice.customer?.name?.toLowerCase().includes(query) ||
          invoice._id?.toLowerCase().includes(query) ||
          invoice.payments?.[0]?.mode?.toLowerCase().includes(query) ||
          invoice.totalAmount?.toString().includes(query)
        );
      });
    }

    return result;
  }, [activeFilter, invoiceData, searchQuery]);

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      const response = await axios.delete(`${baseUrl}/quotation/${invoiceId}`, {
        withCredentials: true,
      });
      if (response.data) {
        setInvoiceData((prevData) =>
          prevData.filter((invoice) => invoice._id !== invoiceId),
        );
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error(error.response?.data?.message || "Error deleting quotation");
    } finally {
      setOpenMenuId(null); // Close the dropdown
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "totalAmount",
        header: "Amount",
        cell: (info) => `₹${info.getValue() || 0}`,
      },
      {
        accessorKey: "_id",
        header: "Bill No",
        cell: (info) => info.getValue()?.slice(-6).toUpperCase() || "N/A",
      },
      {
        accessorKey: "customer.name",
        header: "Customer Name",
        cell: (info) => info.row.original.customer?.name || "N/A",
      },
      {
        header: "Payment Mode",
        cell: (info) => info.row.original.payments?.[0]?.mode || "N/A",
      },
      {
        header: "Status",
        cell: (info) => {
          const payment = info.row.original.payments?.[0];
          const paymentStatus = payment
            ? payment.isFullyPaid
              ? "Paid"
              : "Pending"
            : "Pending";
          const color = paymentStatus === "Paid" ? "green" : "#f39c12";
          return (
            <span style={{ color, fontWeight: 600 }}>{paymentStatus}</span>
          );
        },
      },
      {
        accessorKey: "quotationDate",
        header: "Date",
        cell: (info) => {
          const date = info.getValue();
          if (!date) return "N/A";
          const dateObj = new Date(date);
          return dateObj.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
      },
      {
        header: "View",
        cell: (info) => (
          <div className="view-section">
            <span
              onClick={() => {
                setOpenInvoiceCard(true);
                setSelectedInvoice(info.row.original);
              }}
              className="view-link"
            >
              Quotation
            </span>
            <br />
            <Link
              to={`/quotation/${info.row.original._id}`}
              className="view-link"
            >
              View
            </Link>
          </div>
        ),
      },
      {
        header: "Actions",
        cell: (info) => {
          const invoiceId = info.row.original._id;

          return (
            <div className="actions-dropdown">
              <button
                className="three-dots-button"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMenuPosition({
                    top: rect.bottom + window.scrollY - 50,
                    left: rect.left + window.scrollX - 120,
                  });
                  setOpenMenuId(invoiceId);
                }}
              >
                <BsThreeDots />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
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

  const DropdownMenu = () => {
    if (!openMenuId) return null;

    return (
      <div
        className="dropdown-menu-portal"
        style={{
          position: "absolute",
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
        }}
      >
        <button
          onClick={() => {
            handleDeleteInvoice(openMenuId);
            setOpenMenuId(null);
          }}
          className="row-delete-btn"
        >
          Delete
        </button>
      </div>
    );
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
  });

  let totalInvoiceAmount = 0;

  invoiceData.forEach((invoice) => {
    totalInvoiceAmount += invoice.totalAmount || 0;
  });

  // Helper function to safely get payment mode
  const getPaymentMode = (item) => {
    return item?.payments?.[0]?.mode || "N/A";
  };

  // Helper function to safely get payment status
  const getPaymentStatus = (item) => {
    const payment = item?.payments?.[0];
    if (!payment) return "Pending";
    return payment.isFullyPaid ? "Paid" : "Pending";
  };

  return (
    <div className="invoice">
      <DropdownMenu />
      {openInvoiceCard && (
        <CardInvoice
          setOpenInvoiceCard={setOpenInvoiceCard}
          onClose={() => setOpenInvoiceCard(false)}
          title="Quotation"
          dateName="Quotation"
          invoiceSmData={selectedInvoice}
        />
      )}

      <div className="invoice-top">
        <h1>Quotation</h1>
        <Link className="primary-btn" to={"/new-quotation"}>
          <Plus size={20} /> Create Quotation
        </Link>
      </div>

      <div className="invoice-content">
        <div className="invoice-content-items">
          {["All", "Pending", "Paid"].map((filter) => (
            <span
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? "active-filter" : ""}
            >
              {filter === "All" ? "All Transactions" : filter}
            </span>
          ))}
        </div>

        <div className="invoice-content-inputs">
          <div className="invoice-content-left">
            <div className="invoice-content-inputs-search">
              <Search className="search-icon" />
              <input
                type="search"
                placeholder="Search by customer, bill no, amount..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="invoice-content-right">
            <p>
              <span>Total </span> <span>₹{totalInvoiceAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="invoice-sm">
        <div className="invoice-sm-items">
          {filteredData?.map((item, index) => (
            <div className="invoice-sm-item" key={index}>
              <div className="invoice-sm-item-left">
                <div className="invoice-sm-item-top">
                  <p>{item?.customer?.name || "N/A"}</p>
                </div>
                <div className="invoice-sm-item-bill">
                  <span>
                    {item._id?.slice(-6) || "N/A"}{" "}
                    <span className="mode">{getPaymentMode(item)}</span>
                  </span>
                </div>

                <div className="invoice-sm-status">
                  <p>
                    <span>Status: </span>
                    {getPaymentStatus(item) === "Paid" ? (
                      <span className="pay-done">Paid</span>
                    ) : (
                      <span className="pay-pending">Pending</span>
                    )}
                  </p>
                </div>
                <div className="invoice-sm-view">
                  <span
                    onClick={() => {
                      setOpenInvoiceCard(true);
                      setSelectedInvoice(item);
                    }}
                    className="sm-view"
                  >
                    Invoice
                  </span>
                  <Link className="sm-view" to={`/quotation/${item?._id}`}>
                    View
                  </Link>
                </div>
              </div>
              <div className="invoice-sm-item-right">
                <h3>₹{item?.totalAmount || 0}</h3>

                <p>{formatDate(item.quotationDate)}</p>

                <span onClick={() => handleDeleteInvoice(item?._id)}>
                  <FaRegTrashAlt className="bin-icon" /> Delete
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="invoice-table">
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
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
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
  );
};

export default Quotation;
