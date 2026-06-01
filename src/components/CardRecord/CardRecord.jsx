import "./CardRecord.scss";

import { RxCross2 } from "react-icons/rx";
import { ArrowRight, CirclePlus } from "lucide-react";
import { baseUrl } from "../../main";
import axios from "axios";
import LoadingButton from "../LoadingButton/LoadingButton";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "../../utils/dateFormat";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const paymentTypes = ["UPI", "Cash", "Card", "Net Banking"];

const CardRecord = ({ setCardRecordOpen, invoiceData }) => {
  const handleClose = () => {
    setCardRecordOpen(false);
  };

  const navigate = useNavigate();

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedPaymentType, setSelectedPaymentType] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const {
    _id,
    dueDate,
    invoiceDate,
    amountBalance,
    customer,
    totalAmount,
    bank,
  } = invoiceData;

  const newDate = formatDate(invoiceDate);
  const lastDate = formatDate(dueDate);

  const handleSubmit = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      return toast.error("Please enter a valid amount");
    }

    if (Number(paymentAmount) > amountBalance) {
      return toast.error(
        `Amount must be less than or equal to ₹${amountBalance}`,
      );
    }

    if (!selectedPaymentType) {
      return toast.error("Please select a payment type");
    }

    setIsLoading(true);

    try {
      await axios.put(
        `${baseUrl}/invoice/${_id}`,
        {
          paymentAmount: Number(paymentAmount),
          paymentDate,
          paymentMode: selectedPaymentType,
          notes: paymentNote,
        },
        {
          withCredentials: true,
        },
      );

      toast.success("Payment recorded successfully");
      setCardRecordOpen(false);
      navigate(0);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cardRecord">
      <div className="cardRecord-container">
        <div className="cardRecord-top">
          <div className="cardRecord-top-left">
            <RxCross2 className="cross-icon" onClick={handleClose} />
            <h2>Record Payment</h2>
          </div>

          <LoadingButton
            isLoading={isLoading}
            onClick={handleSubmit}
            disabled={amountBalance === 0}
          >
            Update Payments <ArrowRight size={20} />
          </LoadingButton>
        </div>

        <div className="cardRecord-form">
          <p className="det"> Details</p>

          <div className="cardRecord-form-top">
            <h3>{customer?.name}</h3>
            <p>Balance ₹ {amountBalance}</p>
          </div>
          <p className="record-date">
            {newDate}, Due on {lastDate}
          </p>
          <form action="">
            <p>Payment Details</p>
            <div className="form-group">
              <label htmlFor="">
                <span>*</span>Amount to be Recorded
              </label>
              <input
                type="number"
                placeholder="enter amount to be recorded..."
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
              <p className="recordTotal">Total Amount ₹ {totalAmount}</p>
            </div>
            <div className="form-group">
              <label htmlFor=""> Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="">Payment Type</label>
              <div className="payment-types">
                {paymentTypes.map((type) => (
                  <span
                    key={type}
                    onClick={() => setSelectedPaymentType(type)}
                    className={selectedPaymentType === type ? "selected" : ""}
                  >
                    {type}
                    {selectedPaymentType === type && (
                      <FaCheckCircle
                        style={{ marginLeft: "6px", color: "#1ec773" }}
                      />
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="">Notes</label>
              <input
                type="text"
                placeholder="enter payment note..."
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>

            <div className="form-group record-bank">
              <label htmlFor="">Bank Details</label>
              <div className="cardRecord-bank-details-items">
                <p>
                  <span>Bank Holder Name:</span>
                  <span>{bank?.accountHolderName}</span>
                </p>
                <p>
                  <span>Account Number:</span>
                  <span>{bank?.accountNumber}</span>
                </p>
                <p>
                  <span>IFSC Code:</span>
                  <span>{bank?.ifscCode}</span>
                </p>
                <p>
                  <span>Bank Name:</span>
                  <span>{bank?.bankName}</span>
                </p>
                <p>
                  <span>Branch Name:</span>
                  <span>{bank?.branchName}</span>
                </p>
                <p>
                  <span>UPI ID:</span>
                  <span>{bank?.upiId}</span>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CardRecord;
