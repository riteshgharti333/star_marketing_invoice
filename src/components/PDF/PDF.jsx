import "./PDF.scss";
import check_img from "../../assets/images/check.png";
import cross_img from "../../assets/images/cross.png";
import logo from "../../assets/images/logo.png";
import { PDFViewer } from "@react-pdf/renderer";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ToWords } from "to-words";

import { baseUrl } from "../../main";

import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { IoIosArrowDown } from "react-icons/io";
import { IoMailUnreadOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";

const PDF = () => {
  const { name, id } = useParams();

  const [data, setData] = useState({});

  const pdfRef = useRef();

  const handleDownloadPDF = async () => {
    const input = pdfRef.current;

    const canvas = await html2canvas(input, {
      scale: 2, // Increase scale for better quality (2 is usually enough)
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.7);
    const pdf = new jsPDF("p", "mm", "a4");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = (canvas.width * 210) / canvas.width;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
    pdf.save(`invoice_${shortId}.pdf`);
  };

  useEffect(() => {
    const getAllInvoice = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/${name}/${id}`);
        if (data) {
          if (name === "invoice" && data.invoice) {
            setData(data.invoice);
          } else if (name === "quotation" && data.quotation) {
            setData(data.quotation);
          }
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };
    getAllInvoice();
  }, []);

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
  } = data;

  const shortId = _id?.slice(-6);

  const formattedDueDate = formatDate(dueDate);
  const formattedInvoiceDate = formatDate(invoiceDate);

  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: true, // ⬅ ignore decimal values
      ignoreZeroCurrency: false,
      currencyOptions: {
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paisa",
          plural: "Paise",
          symbol: "",
        },
      },
    },
  });

  let word;
  if (totalAmount) {
    word = toWords.convert(totalAmount);
  }
  const navigate = useNavigate();

  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    const email = customer?.email;
    setIsSending(true);

    try {
      await toast.promise(
        (async () => {
          // 1. Generate PDF
          const canvas = await html2canvas(pdfRef.current, {
            scale: 2,
            useCORS: true,
            logging: true, // You can remove this later
          });

          const pdf = new jsPDF("p", "mm", "a4");
          const imgData = canvas.toDataURL("image/jpeg", 0.7);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const imgWidth = pdfWidth - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);

          const pdfBlob = pdf.output("blob");

          const formData = new FormData();
          formData.append("pdf", pdfBlob, `${name}_${id}.pdf`);
          formData.append("recipientEmail", email);
          formData.append(
            "subject",
            `${name === "quotation" ? "Quotation" : "Invoice"} #${id.slice(-6)}`,
          );
          formData.append(
            "message",
            `Dear ${data.customer?.name},\n\nPlease find attached your document.`,
          );

          await axios.post(`${baseUrl}/invoice/send-email`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        })(),
        {
          loading: `Sending to ${email}...`,
          success: "Email sent successfully!",
          error: (err) =>
            err?.response?.data?.message || "Failed to send email",
        },
      );
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setIsSending(false); // Re-enable the button after the process
    }
  };

  const [openSend, setOpenSend] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenSend(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendWhatsApp = async () => {
    const phone = customer?.phone;
    if (!phone) {
      toast.error("Customer phone number is required");
      return;
    }

    setIsSending(true);

    try {
      await toast.promise(
        (async () => {
          // 1. Generate PDF
          const canvas = await html2canvas(pdfRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
          });

          const pdf = new jsPDF("p", "mm", "a4");
          const imgData = canvas.toDataURL("image/jpeg", 0.7);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const imgWidth = pdfWidth - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);

          // Convert PDF to blob
          const pdfBlob = pdf.output("blob");

          // Create FormData to send to backend
          const formData = new FormData();
          formData.append("pdf", pdfBlob, `${name}_${shortId}.pdf`);
          formData.append("recipientPhone", phone);
          formData.append(
            "message",
            `Dear ${customer?.name},\n\nPlease find attached your ${
              name === "quotation" ? "quotation" : "invoice"
            } #${shortId}.`,
          );

          // Send to your backend which will use Twilio
          const response = await axios.post(
            `${baseUrl}/send-whatsapp-twilio`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );

          return response;
        })(),
        {
          loading: `Sending to ${phone}...`,
          success: "WhatsApp message sent successfully!",
          error: (err) => {
            console.error("WhatsApp sending error:", err);
            return (
              err.response?.data?.message || "Failed to send WhatsApp message"
            );
          },
        },
      );
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="pdf">
      <div className="pdf-back">
        <div className="pdf-back-left">
          <FaArrowLeftLong className="back-icon" onClick={() => navigate(-1)} />
        </div>
        <div className="pdf-back-right">
          <button onClick={handleDownloadPDF}>Download PDF</button>
          <span onClick={() => setOpenSend(!openSend)}>
            Send <IoIosArrowDown />
          </span>
          {openSend && (
            <div className="pdf-send-dropdown" ref={dropdownRef}>
              <p
                onClick={!isSending ? handleSendEmail : null}
                style={{
                  pointerEvents: isSending ? "none" : "auto",
                  opacity: isSending ? 0.6 : 1,
                  cursor: isSending ? "not-allowed" : "pointer",
                }}
              >
                <IoMailUnreadOutline className="mail-icon" />{" "}
                {isSending ? "Sending..." : "Email"}
              </p>

              <p>
                <FaWhatsapp className="mail-icon" /> Whatsapp
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="pdf-main" ref={pdfRef}>
        <div className="pdf-container">
          <div className="pdf-container-top">
            <p></p>
            <p>{name === "quotation" ? "Quotation" : "Invoice"}</p>
            <p>Original for recipient</p>
          </div>

          <hr />

          <div className="pdf-container-company">
            <div className="pdf-container-company-left">
              <div className="pdf-container-company-left-top">
                <div className="pdf-container-company-left-top-left">
                  <img src={logo} alt="" />
                </div>
                <div className="pdf-container-company-left-top-right">
                  <p>
                    <span className="comp-name">Star Marketing</span>
                  </p>
                  <p>
                    <span>PAN: </span>
                    <span>EBUPA1696D</span>
                  </p>
                  <p>
                    <span></span>
                    <span>
                      Sabalpura Powerhouse Colony Park, ward no. 64 , Fatehpur
                      Road, Sikar
                    </span>
                  </p>
                  <p>
                    <span>Sikar, RAJASTHAN, 332001</span>
                  </p>

                  <p>
                    <span>Mobile: </span>
                    <span>+91 8209326351, 9694876221</span>
                  </p>
                  <p>
                    <span>Email: </span>
                    <span>Sohelali@wingstarnarketing.com</span>
                  </p>
                  <p>
                    <span>Website: </span>
                    <span>Wingstarnarketing.com</span>
                  </p>
                </div>
              </div>

              <div className="pdf-container-company-left-bottom">
                <span>Customer Details:</span>
                <span>{customer?.name}</span>
                <span>Ph: {customer?.phone}</span>
              </div>
            </div>

            <div className="pdf-container-company-right">
              <div className="pdf-container-company-right-top">
                <div className="pdf-container-company-right-top-left">
                  <span>
                    {name === "quotation" ? "Quotation" : "Invoice"} #:
                  </span>
                  <span>{shortId}</span>
                </div>
                <div className="pdf-container-company-right-top-right">
                  <span>
                    {" "}
                    {name === "quotation" ? "Quotation" : "Invoice"} Date:
                  </span>
                  <span>{formattedInvoiceDate}</span>
                </div>
              </div>
              <hr />
              <div className="pdf-container-company-right-bottom">
                <span>Due Date:</span>
                <span>{formattedDueDate}</span>
              </div>
            </div>
          </div>

          <div class="pdf-item">
            <table class="pdf-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item Name</th>
                  <th>HSN/SAC</th>
                  <th>Rate/Item</th>
                  <th>Qty</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((item, index) => (
                  <tr>
                    <td>{item._id}</td>
                    <td>{item.name}</td>
                    <td>{}</td>
                    <td>₹{item.unitPrice}</td>

                    <td>{item.quantity}</td>
                    <td>
                      ₹{item.totalAmount} (Discount: {item.discountType}
                      {item.discount})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <hr />
          <div className="pdf-qty">
            {/* <div className="pdf-qty-item">
            <p>Total Items / Qty : 1 / 1</p>
          </div> */}
            <div className="pdf-qty-item disc">
              <p>Extra Discount </p>
              <p>
                -{extraDiscountType} {extraDiscount}
              </p>
            </div>
            <div className="pdf-qty-item total disc">
              <p>Total </p>
              <p>₹ {totalAmount}</p>
            </div>
            <div className="pdf-qty-item disc">
              <p>Total Discount </p>
              <p>-₹ {totalDiscount}</p>
            </div>
            <div className="pdf-qty-item disc">
              <p>Amount Paid </p>
              <p>
                -₹{" "}
                {payments?.reduce(
                  (total, payment) => total + (payment.amount || 0),
                  0,
                )}
              </p>
            </div>
            <div className="pdf-qty-item disc">
              <p>Amount Pending </p>
              <p>-₹ {amountBalance}</p>
            </div>
            <div className="pdf-qty-item words">
              <p>Total amount (in words): INR {word}</p>
            </div>
            <div className="pdf-qty-item paid">
              {payments?.some((payment) => payment.isFullyPaid) ? (
                <>
                  <img src={check_img} className="pdf-icon check" />
                  <p>Amount Paid</p>
                </>
              ) : (
                <>
                  <img src={cross_img} className="pdf-icon cross" />
                  <p>Amount Pending</p>
                </>
              )}
            </div>
          </div>

          <div className="pdf-details">
            <div className="pdf-details-left">
              <div className="pdf-details-left-left">
                <p className="bank-detail">Bank Details</p>

                <div className="pdf-details-left-left-item">
                  <p>
                    <span>Holder Name: </span>
                    <span>{bank?.accountHolderName}</span>
                  </p>
                  <p>
                    <span>Bank: </span>
                    <span>{bank?.bankName}</span>
                  </p>
                  <p>
                    <span>Account #: </span>
                    <span>{bank?.accountNumber}</span>
                  </p>
                  <p>
                    <span>IFSC Code: </span>
                    <span>{bank?.ifscCode}</span>
                  </p>
                  <p>
                    <span>Branch: </span>
                    <span>{bank?.branchName}</span>
                  </p>
                  <p>
                    <span>Upi Id: </span>
                    <span>{bank?.upiId}</span>
                  </p>
                </div>
              </div>

              <div className="pdf-details-left-right">{/* UPI */}</div>
            </div>
            <div className="pdf-details-right">
              <p>For star marketing</p>
              <p>Authorized Signatory</p>
              <div className="pdf-details-right-img">
                <img src={signature?.signatureImage} alt="" />
              </div>
            </div>
          </div>

          <div className="pdf-notes">
            <div className="pdf-notes-left">
              <p>Notes</p>

              <span>{notes}</span>
            </div>
            <div className="pdf-notes-right">
              <p>Terms and Conditions:</p>
              <span>{terms}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDF;
