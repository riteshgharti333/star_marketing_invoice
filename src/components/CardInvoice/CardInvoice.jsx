import "./CardInvoice.scss";

import { RxCross2 } from "react-icons/rx";
import { ArrowRight, CirclePlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import axios from "axios";
import { baseUrl } from "../../main";
import { useState } from "react";
import { toast } from "sonner";
import CardRecord from "../CardRecord/CardRecord";

const CardInvoice = ({ invoiceSmData, setOpenInvoiceCard, title }) => {
  const handleClose = () => {
    setOpenInvoiceCard(false);
  };

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

  const {
    _id,
    dueDate,
    invoiceDate,
    amountBalance,
    totalAmount,
    totalDiscount,
    reference,
    extraDiscount,
    extraDiscountType,
    notes,
    terms,
    customer,
    bank,
    signature,
    payments,
    products,
    moneyReceived,
  } = invoiceSmData;

  const shortId = _id?.slice(-6);

  const formattedDueDate = formatDate(dueDate);

  const formattedInvoiceDate = formatDate(
    title === "Quotation" ? invoiceSmData.quotationDate : invoiceDate,
  );

  const [moneyRec, setMoneyRec] = useState(moneyReceived);

  const handleCheckboxChange = async (e) => {
    const isChecked = e.target.checked;
    setMoneyRec(isChecked);
    await updateInvoice(isChecked);
  };

  const navigate = useNavigate();

  const endpoint = `${baseUrl}/${
    title === "Quotation" ? "quotation" : "invoice"
  }/${_id}`;

  const updateInvoice = async (newValue) => {
    try {
      const { data } = await axios.put(
        endpoint,
        {
          moneyReceived: newValue,
        },
        {
          withCredentials: true,
        },
      );

      const updatedDoc =
        title === "Quotation" ? data?.quotation : data?.invoice;

      if (updatedDoc) {
        const successMsg = updatedDoc.moneyReceived
          ? "Payment received"
          : "Payment not received";

        toast.success(successMsg);
        setMoneyRec(updatedDoc.moneyReceived);
        navigate(0);
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      setMoneyRec(!newValue);
      toast.error(error.response.data.message);
    }
  };

  const [cardRecordOpen, setCardRecordOpen] = useState(false);

  return (
    <div className="cardInvoice">
      {cardRecordOpen && (
        <CardRecord
          invoiceData={invoiceSmData}
          setCardRecordOpen={setCardRecordOpen}
        />
      )}
      <div className="cardInvoice-container">
        <div className="cardInvoice-top">
          <div className="cardInvoice-top-left">
            <RxCross2 className="cross-icon" onClick={handleClose} />
            <h2>{title}</h2>
          </div>

          <div className="cardInvoice-top-right">
            <button
              onClick={() => setCardRecordOpen(true)}
              className="primary-btn"
            >
              Record ₹
            </button>

            <Link
              className="primary-btn"
              to={`/${title === "Quotation" ? "quotation" : "invoice"}/${_id}`}
            >
              View PDF
            </Link>
          </div>
        </div>

        <div className="cardInvoice-desc">
          <p className="details">Details</p>

          <div className="cardInvoice-content">
            <div className="cardInvoice-content-left">
              <div className="cardInvoice-content-left-item">
                <span className="invoice-name">
                  {customer?.name?.charAt(0)}
                </span>
              </div>

              <div className="cardInvoice-content-left-item2">
                <p>{customer?.name}</p>
                <div className="cardInvoice-content-left-item2-item">
                  <p>
                    {title} Date <span>{formattedInvoiceDate}</span>
                  </p>
                  <p>
                    Due Date <span>{formattedDueDate}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cardInvoice-price">
          <h3>₹{totalAmount}</h3>

          <div className="cardInvoice-price-customer">
            <table className="cardInvoice-table">
              <tr>
                <td>Customer</td>
                <td>{customer?.name}</td>
              </tr>
              <tr>
                <td>Phone Number</td>
                <td>{customer?.phone}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{customer?.email}</td>
              </tr>
            </table>
          </div>

          <table className="cardInvoice-product-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, index) => (
                <tr>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.unitPrice}</td>
                  <td>
                    ₹{item.totalAmount} (Discount: {item.discountType}
                    {item.discount})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cardInvoice-total-amount">
            <div className="cardInvoice-total-amount-item">
              <p>Extra Discount:</p>
              <span>
                {extraDiscountType} {extraDiscount}
              </span>
            </div>
            <div className="cardInvoice-total-amount-item">
              <p>Total Amount:</p>
              <span>₹{totalAmount}</span>
            </div>
            <div className="cardInvoice-total-amount-item">
              <p>Total Discount:</p>
              <span>₹{totalDiscount}</span>
            </div>
            <hr />
            <div className="cardInvoice-total-amount-item">
              <p>Amount Paid:</p>
              <span>
                ₹
                {payments?.reduce(
                  (total, payment) => total + (payment.amount || 0),
                  0,
                )}
              </span>
            </div>

            <div className="cardInvoice-total-amount-item">
              <p>Amount Pending:</p>
              <span>₹{amountBalance}</span>
            </div>
          </div>

          <div className="cardInvoice-received">
            <p> Money received </p>

            <label class="switch">
              <input
                type="checkbox"
                className="checkbox"
                checked={moneyRec}
                onChange={handleCheckboxChange}
              />
              <div class="slider"></div>
            </label>
          </div>
          <div className="cardInvoice-payments">
            <p>Payments</p>
            <span>
              {payments && payments.length > 0
                ? payments[payments.length - 1].mode
                : "N/A"}
            </span>
          </div>

          <div className="cardInvoice-bank-details">
            <p>Bank Details:</p>

            <div className="cardInvoice-bank-details-items">
              <p>
                <span>Bank Holder Name:</span>{" "}
                <span>{bank?.accountHolderName}</span>
              </p>
              <p>
                <span>Account Number:</span> <span>{bank?.accountNumber}</span>
              </p>
              <p>
                <span>IFSC Code:</span> <span>{bank?.ifscCode}</span>
              </p>
              <p>
                <span>Bank Name:</span> <span>{bank?.bankName}</span>
              </p>
              <p>
                <span>Branch Name:</span> <span>{bank?.branchName}</span>
              </p>
              <p>
                <span>UPI ID:</span> <span>{bank?.upiId}</span>
              </p>
            </div>
          </div>

          <div className="cardInvoice-signature-details">
            <p>Signature:</p>

            <div className="cardInvoice-signature-details-items">
              <p>
                <span>Signaure Name:</span>{" "}
                <span>{signature?.signatureName}</span>
              </p>
              <p>
                <img src={signature?.signatureImage} alt="" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardInvoice;
