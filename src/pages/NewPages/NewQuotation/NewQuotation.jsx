import "./NewQuotation.scss";

import { useEffect, useRef, useState } from "react";
import { tableData } from "../../../assets/data";
import { MdClose } from "react-icons/md";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  PackageSearch,
  Search,
  Trash,
} from "lucide-react";
import { BsBank2 } from "react-icons/bs";
import { FaPencilAlt } from "react-icons/fa";
import NewCustomer from "../../../components/NewCustomer/NewCustomer";
import NewProduct from "../../../components/NewProduct/NewProduct";
import NewBank from "../../../components/NewBank/NewBank";
import NewSig from "../../../components/NewSig/NewSig";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../main";
import { toast } from "sonner";
import LoadingButton from "../../../components/LoadingButton/LoadingButton";

const NewQuotation = () => {
  const [openDelete, setOpenDelete] = useState(false);

  const cardRef = useRef(null);

  const { customerId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const [openCustomer, setOpenCustomer] = useState(false);
  const [openProduct, setOpenProduct] = useState(false);
  const [openSig, setOpensig] = useState(false);

  const [showNotes, setShowNotes] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [openCross, setOpenCross] = useState(false);
  const [customerData, setCustomerData] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);

  const handleCustomerData = (data) => {
    setCustomerData(data);
    setOpenCross(true);
    setOpenCustomer(false);

    setSearchQuery("");
    setCustomers([]);
  };

  const [bankData, setBankData] = useState(null);
  const [openBank, setOpenBank] = useState(false);
  const [searchBankQuery, setSearchBankQuery] = useState("");
  const [bank, setBank] = useState([]);

  const { bankId } = useParams();

  const handleBankData = (data) => {
    setBankData(data);
    setOpenBank(false);
    setSearchBankQuery("");
    setBank([]);
  };

  const [sigData, setSigData] = useState(null);

  const handleSigData = (data) => {
    console.log(data);
    setSigData(data);
  };

  const [productData, setProductData] = useState([]);
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [product, setProduct] = useState([]);
  const { productId } = useParams();

  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleDeleteProduct = (index) => {
    setProductData((prevData) => prevData.filter((_, i) => i !== index));
    setDeleteIndex(null); // Reset after deletion
  };

  const handleProductData = (data) => {
    setProductData((prevData) => [...prevData, data]);
    setOpenProduct(false);
    setSearchProductQuery("");
    setProduct([]);
  };

  useEffect(() => {
    if (customerId) {
      const getCustomer = async () => {
        try {
          const { data } = await axios.get(`${baseUrl}/customer/${customerId}`);
          if (data && data.customer) {
            setCustomerData(data.customer);
          }
        } catch (error) {
          console.error("Error fetching customer data:", error);
          toast.error(error.response.data.message);
        }
      };

      getCustomer();
    }
  }, [customerId]);

  useEffect(() => {
    if (bankId) {
      const getBank = async () => {
        try {
          const { data } = await axios.get(`${baseUrl}/bank/${bankId}`);
          if (data && data.bank) {
            setBankData(data.bank);
          }
        } catch (error) {
          console.error("Error fetching bank account data:", error);
          toast.error(error.response.data.message);
        }
      };

      getBank();
    }
  }, [bankId]);

  useEffect(() => {
    if (productId) {
      const getProduct = async () => {
        try {
          const { data } = await axios.get(`${baseUrl}/product/${productId}`);
          if (data && data.product) {
            setProduct(data.product || []);
          }
        } catch (error) {
          console.error("Error fetching product data:", error);
          toast.error(error.response.data.message);
        }
      };

      getProduct();
    }
  }, [productId]);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      try {
        const { data } = await axios.get(`${baseUrl}/customer/search`, {
          params: { query },
        });
        setCustomers(data.customers);
      } catch (error) {
        console.error("Error searching customers", error);
        setCustomers([]);
      }
    } else {
      setCustomers([]);
    }
  };

  const handleProductSearchChange = async (e) => {
    const query = e.target.value;
    setSearchProductQuery(query);

    if (query) {
      try {
        const { data } = await axios.get(`${baseUrl}/product/search`, {
          params: { query },
        });
        setProduct(data.products);
      } catch (error) {
        console.error("Error searching product", error);
        setProduct([]);
      }
    } else {
      setProduct([]);
    }
  };

  const handleBankSearchChange = async (e) => {
    const query = e.target.value;
    setSearchBankQuery(query);

    if (query) {
      try {
        const { data } = await axios.get(`${baseUrl}/bank/search`, {
          params: { query },
        });
        setBank(data.banks);
      } catch (error) {
        console.error("Error searching bank account", error);
        setBank([]);
      }
    } else {
      setBank([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setOpenDelete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDelete]);

  const DeleteCard = ({ onDelete, onClose }) => {
    return (
      <div className="delete-card">
        <div className="delete-card-desc" ref={cardRef}>
          <p>Are you sure to delete this?</p>
          <div className="delete-card-btn">
            <button className="primary-btn" onClick={onClose}>
              Close
            </button>
            <button className="delete-btn" onClick={onDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const calculateNetAmount = (item) => {
    const qty = Number(item.price || 0);
    const unitPrice = Number(item.unit || 0);
    const discount = Number(item.discount || 0);
    const discountType = item.discountType || "%";

    const grossAmount = qty * unitPrice;
    let netAmount = grossAmount;

    if (discountType === "%") {
      netAmount = grossAmount * (1 - discount / 100);
    } else if (discountType === "₹") {
      netAmount = grossAmount - discount;
    }

    return Number(netAmount > 0 ? netAmount : 0);
  };

  const totalInvoiceAmount = productData.reduce(
    (acc, item) => acc + calculateNetAmount(item),
    0,
  );

  const calculateDiscountAmount = (item) => {
    const qty = Number(item.price || 0);
    const unitPrice = Number(item.unit || 0);
    const discount = Number(item.discount || 0);
    const discountType = item.discountType || "%";

    const grossAmount = qty * unitPrice;
    let discountAmount = 0;

    if (discountType === "%") {
      discountAmount = (grossAmount * discount) / 100;
    } else if (discountType === "₹") {
      discountAmount = discount;
    }

    return Number(discountAmount > 0 ? discountAmount : 0);
  };

  const totalDiscountAmount = productData.reduce(
    (acc, item) => acc + calculateDiscountAmount(item),
    0,
  );

  const [extraDiscount, setExtraDiscount] = useState(0);
  const [extraDiscountType, setExtraDiscountType] = useState("%");

  const handleDiscountTypeChange = (e) => {
    setExtraDiscountType(e.target.value);
  };

  const handleExtraDiscountChange = (e) => {
    const value = e.target.value;
    const discountValue = value ? parseFloat(value) : 0;
    setExtraDiscount(discountValue);
  };

  let totalOfTotalDiscount = 0;

  const calculateTotalAmount = () => {
    let totalAmount = 0;
    let itemWiseGrossTotal = 0;

    productData.forEach((item) => {
      const qty = Number(item.price || 0);
      const unitPrice = Number(item.unit || 0);
      const grossAmount = qty * unitPrice;

      itemWiseGrossTotal += grossAmount;

      const netAmount = calculateNetAmount(item);
      totalAmount += netAmount;
    });

    const totalItemDiscount = itemWiseGrossTotal - totalAmount;

    let appliedExtraDiscount = 0;
    if (extraDiscount > 0) {
      if (extraDiscountType === "%") {
        appliedExtraDiscount = totalAmount * (extraDiscount / 100);
        totalAmount = totalAmount * (1 - extraDiscount / 100);
      } else if (extraDiscountType === "₹") {
        appliedExtraDiscount = extraDiscount;
        totalAmount -= extraDiscount;
      }
    }

    totalOfTotalDiscount =
      totalItemDiscount + appliedExtraDiscount > 0
        ? totalItemDiscount + appliedExtraDiscount
        : 0;

    return totalAmount > 0 ? totalAmount : 0;
  };

  const navigate = useNavigate();

  ///////////////

  const [invoiceForm, setInvoiceForm] = useState({
    quotationDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 15 days from now
    reference: "",
    notes: "",
    terms: "",
    extraDiscount: 0,
    extraDiscountType: "%",
    paymentNotes: "",
    paymentAmount: 0,
    paymentMode: "UPI",
    isFullyPaid: false,
    moneyReceived: false,
  });

  useEffect(() => {
    if (invoiceForm.isFullyPaid) {
      setInvoiceForm((prev) => ({
        ...prev,
        paymentAmount: calculateTotalAmount().toFixed(2),
      }));
    }
  }, [invoiceForm.isFullyPaid, calculateTotalAmount]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInvoiceForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle date changes
  const handleDateChange = (name, value) => {
    setInvoiceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit invoice to backend
  const submitInvoice = async (status = "sent") => {
    setIsLoading(true);
    try {
      if (!customerData) {
        toast.error("Please select a customer");
        return;
      }

      if (productData.length === 0) {
        toast.error("Please add at least one product");
        return;
      }

      const invoiceData = {
        customer: customerData._id,
        // bank: bankData._id,
        // signature: sigData._id,

        products: productData.map((item) => ({
          productId: item._id,
          name: item.name,
          quantity: Number(item.unit || 0),
          unitPrice: Number(item.price || 0),
          discount: Number(item.discount || 0),
          discountType: item.discountType === "₹" ? "₹" : "%",
          totalAmount: calculateNetAmount(item),
        })),
        quotationDate: invoiceForm.quotationDate,
        dueDate: invoiceForm.dueDate,
        reference: invoiceForm.reference,
        notes: invoiceForm.notes,
        terms: invoiceForm.terms,
        totalAmount: calculateTotalAmount().toFixed(2),
        totalDiscount: totalOfTotalDiscount.toFixed(2),
        amountBalance:
          calculateTotalAmount().toFixed(2) -
          Number(invoiceForm.paymentAmount || 0),
        status,
        extraDiscount: extraDiscount || 0,
        extraDiscountType: invoiceForm.extraDiscountType === "₹" ? "₹" : "%",
        moneyReceived: invoiceForm.moneyReceived,

        payments: [
          {
            notes: invoiceForm.paymentNotes,
            amount: Number(invoiceForm.paymentAmount || 0),
            mode: invoiceForm.paymentMode,
            isFullyPaid: invoiceForm.isFullyPaid,
          },
        ],
      };

      if (bankData) {
        invoiceData.bank = bankData._id;
      }

      if (sigData) {
        invoiceData.signature = sigData._id;
      }

      const { data } = await axios.post(
        `${baseUrl}/quotation/new-quotation`,
        invoiceData,
        {
          withCredentials: true,
        },
      );

      console.log(data);

      if (data && data.quotation) {
        toast.success(data.message);
        navigate(`/quotation`);
      }
    } catch (error) {
      console.error("Error creating quotation:", error);
      toast.error(
        error.response?.data?.message || "Failed to create quotation",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save and submit
  const handleSubmit = () => {
    submitInvoice("sent");
  };

  //////////////////

  return (
    <div className="newInvoice">
      {openCustomer && (
        <NewCustomer
          setOpenCustomer={setOpenCustomer}
          handleCustomerData={handleCustomerData}
        />
      )}

      {openProduct && (
        <NewProduct
          setOpenProduct={setOpenProduct}
          handleProductData={handleProductData}
        />
      )}

      {openBank && (
        <NewBank setOpenBank={setOpenBank} handleBankData={handleBankData} />
      )}

      {openSig && (
        <NewSig setOpensig={setOpensig} handleSigData={handleSigData} />
      )}

      <div className="newInvoice-top">
        <Link onClick={() => navigate(-1)} className="newInvoice-top-left">
          <ChevronLeft size={30} />
          <h3>Create Quotation</h3>
        </Link>

        {/* <div className="newInvoice-top-right">
          <button className="primary-btn">Save as draft</button>
          <button className="primary-btn">
            Save <ArrowRight size={20} />
          </button>
        </div> */}
      </div>
      <div className="newInvoice-customer">
        <div className="newInvoice-customer-left">
          <div className="newInvoice-customer-left-top">
            <span>Customer Details</span>
            <span onClick={() => setOpenCustomer(true)}>
              <CirclePlus className="plus-icon" />
              Add new Customer?
            </span>
          </div>

          <div className="customer-detail">
            <span>Select Customer</span>

            <div className="customer-detail-search">
              <Search className="search-icon" />
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Select your customer..."
              />

              {customers?.length > 0 && (
                <div className="search-results">
                  {customers?.map((customer) => (
                    <div
                      key={customer._id}
                      className="search-result-item"
                      onClick={() => handleCustomerData(customer)}
                    >
                      <span>{customer.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {customers?.length === 0 && searchQuery && (
                <p className="no-cust">No customers found</p>
              )}
            </div>
          </div>
          {openCross && customerData && (
            <div className="customer-name-sm">
              <p>
                {customerData.name}
                <MdClose
                  className="cross-icon"
                  onClick={() => setOpenCross(false)}
                />
              </p>
            </div>
          )}
        </div>

        <div className="newInvoice-customer-right">
          <div className="newInvoice-customer-right-top">
            <span>Other Details</span>
          </div>

          <div className="newInvoice-customer-right-items">
            <div className="newInvoice-customer-right-item">
              <span>Quotation Date</span>
              <input
                type="date"
                id=""
                name="quotationDate"
                value={invoiceForm.quotationDate}
                onChange={(e) =>
                  handleDateChange("quotationDate", e.target.value)
                }
              />
            </div>
            <div className="newInvoice-customer-right-item">
              <span>Due Date</span>
              <input
                type="date"
                id=""
                name="dueDate"
                value={invoiceForm.dueDate}
                onChange={(e) => handleDateChange("dueDate", e.target.value)}
              />
            </div>
            <div className="newInvoice-customer-right-item">
              <span>Reference</span>
              <input
                type="search"
                placeholder="referecnce..."
                name="reference"
                value={invoiceForm.reference}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>

      {openCross && customerData && (
        <div className="customer-name">
          <p>
            {customerData.name}
            <MdClose
              className="cross-icon"
              onClick={() => setOpenCross(false)}
            />
          </p>
        </div>
      )}

      <div className="newInvoice-product">
        <div className="newInvoice-product-top">
          <span>Product & Services</span>
          <span onClick={() => setOpenProduct(true)}>
            <CirclePlus className="plus-icon" />
            Add new Product?
          </span>
        </div>

        <div className="newInvoice-product-content">
          <div className="newInvoice-product-content-top">
            <div className="newInvoice-product-content-top-item search-input">
              <Search className="search-icon" />
              <input
                type="search"
                placeholder="search for existing products...."
                onChange={handleProductSearchChange}
                value={searchProductQuery}
              />

              {product?.length > 0 && (
                <div className="search-results">
                  {product?.map((item) => (
                    <div
                      key={item._id}
                      className="search-result-item"
                      onClick={() => handleProductData(item)}
                    >
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {product?.length === 0 && searchProductQuery && (
                <p className="no-cust">No product found</p>
              )}
            </div>

            {/* <div className="newInvoice-product-content-top-item">
              <input type="number" placeholder="Qyt" />
            </div>

            <div className="newInvoice-product-content-top-item">
              <button className="primary-btn">
                <CirclePlus className="plus-icon" /> Add to Bill
              </button>
            </div> */}
          </div>

          <div className="newInvoice-sm-table">
            {productData?.map((item, index) => (
              <div className="newInvoice-sm-table-items">
                <div className="newInvoice-sm-table-item">
                  <p>Product Name</p>
                  <span>{item.name}</span>
                </div>

                <div className="newInvoice-sm-table-item">
                  <p>Unit Price </p>
                  <input
                    className="product-item"
                    type="number"
                    placeholder="Unit Price"
                    value={item.unit}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value));
                      const newData = [...productData];
                      newData[index].unit = value;
                      setProductData(newData);
                    }}
                  />
                </div>

                <div className="newInvoice-sm-table-item">
                  <p>Quantity </p>
                  <input
                    className="product-item"
                    type="number"
                    placeholder="Qty"
                    value={item.price}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value));
                      const newData = [...productData];
                      newData[index].price = value;
                      setProductData(newData);
                    }}
                  />
                </div>

                <div className="newInvoice-sm-table-item">
                  <p>Discount On</p>
                  <input
                    className="product-item"
                    type="number"
                    placeholder="Discount"
                    value={item.discount}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value));
                      const newData = [...productData];
                      newData[index].discount = value;
                      setProductData(newData);
                    }}
                  />
                  <select
                    value={item.discountType}
                    onChange={(e) => {
                      const newData = [...productData];
                      newData[index].discountType = e.target.value;
                      setProductData(newData);
                    }}
                  >
                    <option value="%">%</option>
                    <option value="₹">₹</option>
                  </select>
                </div>

                <div className="newInvoice-sm-table-item">
                  <p>Total</p>
                  <span> {calculateNetAmount(item)}</span>
                </div>
                <div className="newInvoice-sm-table-item">
                  <Trash
                    className="trash-icon"
                    onClick={() => handleDeleteProduct(index)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="newInvoice-products-table">
            {productData?.length > 0 ? (
              <table className="newInvoice-products-table-items">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Discount on</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {productData?.map((item, index) => (
                    <tr>
                      <td className="product-item">
                        {item.name}
                        <Trash
                          className="trash-icon"
                          onClick={() => setDeleteIndex(index)}
                        />

                        {deleteIndex === index && (
                          <DeleteCard
                            onDelete={() => handleDeleteProduct(index)}
                            onClose={() => setDeleteIndex(null)}
                          />
                        )}
                      </td>
                      <td>
                        <input
                          className="product-item"
                          type="number"
                          placeholder="qty"
                          value={item.unit}
                          onChange={(e) => {
                            const newData = [...productData];
                            newData[index].unit = Number(e.target.value);
                            setProductData(newData);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          className="product-item"
                          type="number"
                          placeholder="unit price"
                          value={item.price}
                          onChange={(e) => {
                            const newData = [...productData];
                            newData[index].price = Number(e.target.value);
                            setProductData(newData);
                          }}
                        />
                      </td>
                      <td className="disc-data">
                        <input
                          className="product-item"
                          type="number"
                          placeholder="Discount"
                          value={item.discount}
                          onChange={(e) => {
                            const newData = [...productData];
                            newData[index].discount = e.target.value;
                            setProductData(newData);
                          }}
                        />
                        <select
                          value={item.discountType}
                          onChange={(e) => {
                            const newData = [...productData];
                            newData[index].discountType = e.target.value;
                            setProductData(newData);
                          }}
                        >
                          <option value="%">%</option>
                          <option value="₹">₹</option>
                        </select>
                      </td>

                      <td className="product-item">
                        {calculateNetAmount(item)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="table-add">
                <div className="newInvoice-products-table-add">
                  <PackageSearch className="table-icon" />
                  <p>
                    Search existing products to add to this list or add new
                    product to get started! 🚀
                  </p>
                  <button
                    className="primary-btn"
                    onClick={() => setOpenProduct(true)}
                  >
                    <CirclePlus className="plus-icon" /> Add new Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="product-summary">
          <div className="product-summary-left">
            <span>Note, Terms and more...</span>
            <div className="product-summary-left-item">
              <p onClick={() => setShowNotes(!showNotes)}>
                <ChevronRight className="right-icon" />
                Notes
              </p>

              {showNotes && (
                <textarea
                  name="notes"
                  value={invoiceForm.notes}
                  onChange={handleInputChange}
                  placeholder="add business note..."
                ></textarea>
              )}
            </div>
            <div className="product-summary-left-item">
              <p onClick={() => setShowTerms(!showTerms)}>
                <ChevronRight className="right-icon" /> Terms & Condintion
              </p>
              {showTerms && (
                <textarea
                  placeholder="add term and condition..."
                  name="terms"
                  value={invoiceForm.terms}
                  onChange={handleInputChange}
                ></textarea>
              )}
            </div>
          </div>

          <div className="product-summary-right">
            <div className="product-summary-amount">
              <div></div>
              <div className="total-amount">
                <div className="total-amount-top">
                  <span>Extra Discount</span>
                  <div className="total-amount-top-desc">
                    <select
                      name=""
                      id=""
                      value={extraDiscountType}
                      onChange={handleDiscountTypeChange}
                    >
                      <option value="%">%</option>
                      <option value="₹">₹</option>
                    </select>
                    <input
                      type="text"
                      placeholder="extra discount..."
                      name="extraDiscount"
                      onChange={handleExtraDiscountChange}
                    />
                  </div>
                </div>

                <div className="total-amount-money">
                  <div className="total-amount-money-item">
                    <span>Taxable Amount </span>
                    <span>₹{totalInvoiceAmount.toFixed(2)}</span>{" "}
                    {/* Displaying the taxable amount */}
                  </div>

                  {/* <div className="total-amount-money-item">
                    <span>Round Off </span>
                    <span>{roundOffAmount.toFixed(2)}</span>{" "}
                    Assuming you calculate round-off
                  </div> */}

                  <div className="total-amount-money-item big-amount">
                    <span>Total Amount </span>
                    <span>₹{calculateTotalAmount().toFixed(2)}</span>{" "}
                    {/* Displaying the total with extra discount */}
                  </div>

                  <div className="total-amount-money-item">
                    <span>Total Discount </span>
                    <span>₹{totalOfTotalDiscount.toFixed(2)}</span>{" "}
                  </div>
                </div>
              </div>
            </div>

            <div className="product-payment-receive">
              <p> Money received </p>

              <label class="switch">
                <input
                  type="checkbox"
                  name="moneyReceived"
                  className="checkbox"
                  checked={invoiceForm.moneyReceived}
                  onChange={handleInputChange}
                />
                <div class="slider"></div>
              </label>
            </div>

            <div className="product-summary-bank">
              <div className="product-summary-bank-top">
                <span>Select Bank</span>

                <div className="customer-detail-search">
                  <Search className="search-icon" />
                  <input
                    type="search"
                    value={searchBankQuery}
                    onChange={handleBankSearchChange}
                    placeholder="find by account no. and holder name..."
                  />

                  {bank?.length > 0 && (
                    <div className="search-results">
                      {bank?.map((item) => (
                        <div
                          key={item._id}
                          className="search-result-item"
                          onClick={() => handleBankData(item)}
                        >
                          <span>
                            {item.accountHolderName} - {item.accountNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {bank?.length === 0 && searchBankQuery && (
                    <p className="no-cust">No bank account found</p>
                  )}
                </div>
              </div>

              <button onClick={() => setOpenBank(true)}>
                <BsBank2 /> Add Bank to Invoice (Optional)
              </button>
            </div>
            {bankData && (
              <div className="product-bank-name">
                <p>
                  <span>Bank Holder Name:</span>{" "}
                  <span>{bankData.accountHolderName}</span>
                </p>
                <p>
                  <span>Account Number:</span>{" "}
                  <span>{bankData.accountNumber}</span>
                </p>
                <p>
                  <span>IFSC Code:</span> <span>{bankData.ifscCode}</span>
                </p>
                <p>
                  <span>Bank Name:</span> <span>{bankData.bankName}</span>
                </p>
                <p>
                  <span>Branch Name:</span> <span>{bankData.branchName}</span>
                </p>
                <p>
                  <span>UPI ID:</span> <span>{bankData.upiId}</span>
                </p>
              </div>
            )}

            <div className="product-summary-paid">
              <div className="product-summary-paid-top">
                <span>Add payment (Payment Notes, Amount and Mode)</span>

                <div className="fully-paid">
                  <input
                    type="checkbox"
                    name="isFullyPaid"
                    checked={invoiceForm.isFullyPaid}
                    onChange={handleInputChange}
                  />
                  <span>Mark as fully paid</span>
                </div>
              </div>

              <div className="product-summary-paid-items">
                <div className="product-summary-paid-item">
                  <span>Notes</span>
                  <input
                    type="text"
                    id=""
                    placeholder="notes..."
                    name="paymentNotes"
                    value={invoiceForm.paymentNotes}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="product-summary-paid-item">
                  <span>Amount</span>
                  <input
                    type="number"
                    id=""
                    name="paymentAmount"
                    value={invoiceForm.paymentAmount}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="product-summary-paid-item">
                  <span>Payment Mode</span>
                  <select
                    name="paymentMode"
                    value={invoiceForm.paymentMode}
                    onChange={handleInputChange}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="EMI">EMI</option>
                  </select>
                </div>
              </div>

              <div className="product-amount-balance">
                <p>
                  <span>Total Amount:</span>{" "}
                  <span>₹{calculateTotalAmount().toFixed(2)}</span>
                </p>
                <p>
                  <span>Balance Amount:</span>{" "}
                  <span>
                    ₹
                    {calculateTotalAmount().toFixed(2) -
                      invoiceForm.paymentAmount}
                  </span>
                </p>
              </div>
            </div>

            <div className="product-summary-sig">
              <span>Select Signature</span>

              <button onClick={() => setOpensig(true)}>
                <FaPencilAlt /> Add Signature to Invoice (Optional)
              </button>
            </div>

            {sigData && (
              <div className="product-sig-name">
                <img src={sigData.signatureImage} alt="" />
                <p>{sigData.signatureName}</p>
              </div>
            )}
          </div>
        </div>
        <div className="product-summary-btn">
          <LoadingButton isLoading={isLoading} onClick={handleSubmit}>
            Save <ArrowRight className="right-arrow" />
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default NewQuotation;
