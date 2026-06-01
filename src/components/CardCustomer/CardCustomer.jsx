import "./CardCustomer.scss";

import { RxCross2 } from "react-icons/rx";
import { ArrowRight, CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../main";

const CardCustomer = ({ setOpenCustomerCard, customer }) => {
  const handleClose = () => {
    setOpenCustomerCard(false);
  };

  const [invoiceIdData, setInvoiceIdData] = useState([]);

  useEffect(() => {
    const getAllInvoices = async () => {
      try {
        const invoicePromises = customer.invoiceId.map((id) =>
          axios.get(`${baseUrl}/invoice/${id}`),
        );

        const responses = await Promise.all(invoicePromises);
        const invoices = responses.map((res) => res.data.invoice);

        setInvoiceIdData(invoices);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    if (customer?.invoiceId?.length) {
      getAllInvoices();
    }
  }, [customer]);

  const totalAmount = invoiceIdData.reduce(
    (acc, curr) => acc + (curr.totalAmount || 0),
    0,
  );

  const totalClosingBalance = invoiceIdData.reduce(
    (acc, curr) => acc + (curr.amountBalance || 0),
    0,
  );

  return (
    <div className="cardCustomer">
      <div className="cardCustomer-container">
        <div className="cardCustomer-top">
          <div className="cardCustomer-top-left">
            <RxCross2
              className="cross-icon"
              onClick={handleClose} // Cross icon click
            />
            <h2>{customer?.name}</h2>
          </div>

          {/* <button className="primary-btn" onClick={handleClose}>
            Save & Update <ArrowRight size={20} />
          </button> */}
        </div>

        <div className="cardCustomer-desc">
          <p className="details">Details</p>

          <div className="cardCustomer-content">
            <p>Customer Invoices</p>
          </div>
        </div>

        <div className="cardCustomer-price">
          <h3>
            <span>Total Amount:</span> <span>₹{totalClosingBalance}</span>
          </h3>

          {invoiceIdData.map((item, index) => (
            <div className="cardCustomer-sm">
              <div className="cardCustomer-sm-left">
                <p>#{item._id.slice(-6)}</p>
                <p>{new Date(item.invoiceDate).toLocaleDateString()}</p>
                <p>{item.payments?.[0]?.isFullyPaid ? "Paid" : "Pending"}</p>
              </div>
              <div className="cardCustomer-sm-right">
                <p>Amount</p>
                <p>₹{item.totalAmount.toFixed(2)}</p>
                <p>Closing Blance: ₹{item.amountBalance}</p>
              </div>
            </div>
          ))}

          <table className="cardCustomer-product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Closing Balance</th>
                {/* <th>Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {invoiceIdData?.map((item, index) => (
                <tr key={item._id}>
                  <td>#{item._id.slice(-6)}</td>
                  <td>{new Date(item.invoiceDate).toLocaleDateString()}</td>
                  <td>
                    {item.payments?.[0]?.isFullyPaid ? "Paid" : "Pending"}
                  </td>{" "}
                  {/* Payment Status */}
                  <td>₹{item.totalAmount.toFixed(2)}</td> {/* Total Amount */}
                  <td>₹{item.amountBalance}</td>
                  {/* Closing Balance */}
                  {/* <td>
                    <button
                      onClick={() => console.log("Invoice ID:", item._id)}
                    >
                      Delete
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CardCustomer;
