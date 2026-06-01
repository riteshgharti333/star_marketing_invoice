import "./Report.scss";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../main";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Report = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [customerFilter, setCustomerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/invoice/all-invoices`);
        if (data && data.invoices) {
          setInvoices(data.invoices);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const toggleMenu = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  // Filtered data based on user selections
  const filteredInvoices = useMemo(() => {
    let result = invoices;

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      result = result.filter((invoice) => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    }

    // Apply customer filter
    if (customerFilter) {
      const query = customerFilter.toLowerCase();
      result = result.filter((invoice) =>
        invoice.customer?.name?.toLowerCase().includes(query),
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter((invoice) => {
        if (statusFilter === "Overdue") {
          const dueDate = new Date(invoice.dueDate);
          const today = new Date();
          return dueDate < today && invoice.amountBalance > 0;
        }
        const payment = invoice.payments?.[0];
        return payment
          ? statusFilter === "Paid"
            ? payment.isFullyPaid
            : !payment.isFullyPaid
          : statusFilter === "Unpaid";
      });
    }

    return result;
  }, [invoices, dateRange, customerFilter, statusFilter]);

  // Customer Report Data
  const customerReportData = useMemo(() => {
    const customerMap = {};

    filteredInvoices.forEach((invoice) => {
      const customerId = invoice.customer?._id;
      if (!customerId) return;

      if (!customerMap[customerId]) {
        customerMap[customerId] = {
          name: invoice.customer.name,
          invoiceCount: 0,
          totalBilled: 0,
          totalDue: 0,
        };
      }

      customerMap[customerId].invoiceCount += 1;
      customerMap[customerId].totalBilled += invoice.totalAmount;
      customerMap[customerId].totalDue += invoice.amountBalance;
    });

    return Object.values(customerMap);
  }, [filteredInvoices]);

  // Product Sales Report Data
  const productSalesData = useMemo(() => {
    const productMap = {};

    filteredInvoices.forEach((invoice) => {
      invoice.products.forEach((product) => {
        const productId = product.productId;
        if (!productMap[productId]) {
          productMap[productId] = {
            name: product.name,
            quantity: 0,
            revenue: 0,
          };
        }

        productMap[productId].quantity += product.quantity;
        productMap[productId].revenue += product.totalAmount;
      });
    });

    return Object.values(productMap);
  }, [filteredInvoices]);

  // Payment Method Report Data
  const paymentMethodData = useMemo(() => {
    const paymentMap = {};

    filteredInvoices.forEach((invoice) => {
      invoice.payments?.forEach((payment) => {
        const mode = payment.mode || "Unknown";
        if (!paymentMap[mode]) {
          paymentMap[mode] = 0;
        }
        paymentMap[mode] += payment.amount;
      });
    });

    return Object.entries(paymentMap).map(([name, value]) => ({ name, value }));
  }, [filteredInvoices]);

  // Discount Analysis Data
  const discountAnalysisData = useMemo(() => {
    let totalDiscount = 0;
    let rupeeDiscount = 0;
    let percentDiscount = 0;

    filteredInvoices.forEach((invoice) => {
      // Invoice level discount
      if (invoice.extraDiscount) {
        totalDiscount += invoice.extraDiscount;
        if (invoice.extraDiscountType === "₹") {
          rupeeDiscount += invoice.extraDiscount;
        } else {
          percentDiscount += invoice.extraDiscount;
        }
      }

      // Product level discounts
      invoice.products.forEach((product) => {
        if (product.discount) {
          totalDiscount += product.discount;
          if (product.discountType === "₹") {
            rupeeDiscount += product.discount;
          } else {
            percentDiscount += product.discount;
          }
        }
      });
    });

    return {
      totalDiscount,
      rupeeDiscount,
      percentDiscount,
      discountTypes: [
        { name: "Fixed (₹)", value: rupeeDiscount },
        { name: "Percentage (%)", value: percentDiscount },
      ],
    };
  }, [filteredInvoices]);

  // Overdue Invoices
  const overdueInvoices = useMemo(() => {
    const today = new Date();
    return filteredInvoices.filter((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      return dueDate < today && invoice.amountBalance > 0;
    });
  }, [filteredInvoices]);

  // Download reports
  const downloadCSV = (data, filename) => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((obj) => Object.values(obj).join(","));
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  // if (loading) {
  //   return <div className="loading">Loading reports...</div>;
  // }

  return (
    <div className="report">
      <div className="report-top">
        <Link onClick={() => navigate(-1)} className="report-top-left">
          <ChevronLeft size={30} />
          <h3>Business Insights Report</h3>
        </Link>
        {/* <div className="report-actions">
          <button onClick={() => window.print()} className="print-btn">
            <Printer size={18} /> Print Report
          </button>
        </div> */}
      </div>

      <div className="report-content">
        {/* Filters Section */}
        <div className="report-filters">
          <div className="filter-group">
            <label>Date Range:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
            />
          </div>

          <div className="filter-group">
            <label>Customer:</label>
            <input
              type="text"
              placeholder="Filter by customer"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="report-section">
          <div className="section-header">
            <h3>Invoice Summary</h3>
            <button
              onClick={() =>
                downloadCSV(
                  filteredInvoices.map((inv) => ({
                    "Invoice ID": inv._id,
                    Customer: inv.customer?.name,
                    Date: new Date(inv.invoiceDate).toLocaleDateString(),
                    Amount: inv.totalAmount,
                    Status: inv.payments?.[0]?.isFullyPaid
                      ? "Paid"
                      : new Date(inv.dueDate) < new Date()
                        ? "Overdue"
                        : "Unpaid",
                  })), // ← this closing parenthesis was missing
                  "invoice_summary",
                )
              }
              className="btn btn-primary" // ← corrected 'cl' to a full className
            >
              Download CSV
            </button>
          </div>
          <div className="summary-stats">
            <div className="stat-card">
              <h4>Total Invoices</h4>
              <p>{filteredInvoices.length}</p>
            </div>
            <div className="stat-card">
              <h4>Total Billed</h4>
              <p>
                ₹
                {filteredInvoices.reduce(
                  (sum, inv) => sum + inv.totalAmount,
                  0,
                )}
              </p>
            </div>
            <div className="stat-card">
              <h4>Total Received</h4>
              <p>
                ₹
                {filteredInvoices.reduce(
                  (sum, inv) => sum + (inv.payments?.[0]?.amount || 0),
                  0,
                )}
              </p>
            </div>
            <div className="stat-card">
              <h4>Outstanding</h4>
              <p>
                ₹
                {filteredInvoices.reduce(
                  (sum, inv) => sum + inv.amountBalance,
                  0,
                )}
              </p>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice._id}>
                    <td>{invoice._id.slice(-6)}</td>
                    <td>{invoice.customer?.name || "N/A"}</td>
                    <td>
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td>₹{invoice.totalAmount}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          invoice.payments?.[0]?.isFullyPaid
                            ? "paid"
                            : new Date(invoice.dueDate) < new Date()
                              ? "overdue"
                              : "unpaid"
                        }`}
                      >
                        {invoice.payments?.[0]?.isFullyPaid
                          ? "Paid"
                          : new Date(invoice.dueDate) < new Date()
                            ? "Overdue"
                            : "Unpaid"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Report */}
        <div className="report-section">
          <div className="section-header">
            <h3>Customer Report</h3>
            <button
              onClick={() => downloadCSV(customerReportData, "customer_report")}
              className="download-btn"
            >
              <Download size={16} /> CSV
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Invoices</th>
                  <th>Total Billed</th>
                  <th>Total Due</th>
                </tr>
              </thead>
              <tbody>
                {customerReportData.slice(0, 5).map((customer) => (
                  <tr key={customer.name}>
                    <td>{customer.name}</td>
                    <td>{customer.invoiceCount}</td>
                    <td>₹{customer.totalBilled}</td>
                    <td>₹{customer.totalDue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Sales Report */}
        <div className="report-section">
          <div className="section-header">
            <h3>Product Sales Report</h3>
            <button
              onClick={() =>
                downloadCSV(
                  productSalesData.map((p) => ({
                    Product: p.name,
                    Quantity: p.quantity,
                    Revenue: p.revenue,
                  })),
                  "product_sales",
                )
              }
              className="download-btn"
            >
              <Download size={16} /> CSV
            </button>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productSalesData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" name="Revenue (₹)" fill="#8884d8" />
                <Bar dataKey="quantity" name="Quantity" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Report */}
        <div className="report-section">
          <div className="section-header">
            <h3>Payment Method Breakdown</h3>
            <button
              onClick={() =>
                downloadCSV(
                  paymentMethodData.map((p) => ({
                    Method: p.name,
                    Amount: p.value,
                  })),
                  "payment_methods",
                )
              }
              className="download-btn"
            >
              <Download size={16} /> CSV
            </button>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discount Analysis */}
        <div className="report-section">
          <div className="section-header">
            <h3>Discount Analysis</h3>
            <button
              onClick={() =>
                downloadCSV(
                  [
                    {
                      "Total Discount": discountAnalysisData.totalDiscount,
                      "Fixed Discount (₹)": discountAnalysisData.rupeeDiscount,
                      "Percentage Discount (%)":
                        discountAnalysisData.percentDiscount,
                    },
                  ],
                  "discount_analysis",
                )
              }
              className="download-btn"
            >
              <Download size={16} /> CSV
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Discount</h4>
              <p>₹{discountAnalysisData.totalDiscount}</p>
            </div>
            <div className="stat-card">
              <h4>Fixed Discount (₹)</h4>
              <p>₹{discountAnalysisData.rupeeDiscount}</p>
            </div>
            <div className="stat-card">
              <h4>Percentage Discount (%)</h4>
              <p>₹{discountAnalysisData.percentDiscount}</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={discountAnalysisData.discountTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {discountAnalysisData.discountTypes.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {overdueInvoices.length > 0 && (
          <div className="report-section alert-section">
            <div className="section-header">
              <h3>⚠️ Overdue Invoice Alerts</h3>
              <button
                onClick={() =>
                  downloadCSV(
                    overdueInvoices.map((inv) => ({
                      "Invoice ID": inv._id,
                      Customer: inv.customer?.name,
                      "Due Date": new Date(inv.dueDate).toLocaleDateString(),
                      "Amount Due": inv.amountBalance,
                      "Days Overdue": Math.floor(
                        (new Date() - new Date(inv.dueDate)) /
                          (1000 * 60 * 60 * 24),
                      ),
                    })), // ← close .map() here
                    "overdue_invoices", // ← this is now the second argument to downloadCSV
                  )
                }
                className="download-btn"
              >
                <Download size={16} /> CSV
              </button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Customer</th>
                    <th>Due Date</th>
                    <th>Amount Due</th>
                    <th>Days Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueInvoices.map((invoice) => (
                    <tr key={invoice._id} className="overdue-row">
                      <td>{invoice._id.slice(-6)}</td>
                      <td>{invoice.customer?.name || "N/A"}</td>
                      <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td>₹{invoice.amountBalance}</td>
                      <td>
                        {Math.floor(
                          (new Date() - new Date(invoice.dueDate)) /
                            (1000 * 60 * 60 * 24),
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
