import "./NewCustomer.scss";

import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { ArrowRight, CirclePlus } from "lucide-react";
import NewAdd from "../NewAdd/NewAdd";
import axios from "axios";
import { baseUrl } from "../../main";
import { toast } from "sonner";
import LoadingButton from "../LoadingButton/LoadingButton";

const NewCustomer = ({ setOpenCustomer, handleCustomerData }) => {
  const handleClose = () => {
    setOpenCustomer(false);
  };

  const [openAdd, setOpenAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    email: "",
    // gstin: "",
    // companyName: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${baseUrl}/customer/new-customer`,
        userData,
        { withCredentials: true },
      );

      if (data && data.customer) {
        console.log(data);
        toast.success(data.message);
        setOpenCustomer(false);
        handleCustomerData(data.customer);
      }
      handleClose();
    } catch (error) {
      console.error("Error saving customer data", error);
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="newCustomer">
      {openAdd && <NewAdd setOpenAdd={setOpenAdd} />}

      <div className="newCustomer-container">
        <div className="newCustomer-top">
          <div className="newCustomer-top-left">
            <RxCross2 className="cross-icon" onClick={handleClose} />
            <h2>Add Customer</h2>
          </div>
          <LoadingButton isLoading={isLoading} onClick={handleSave}>
            Save <ArrowRight size={20} />
          </LoadingButton>
        </div>

        <div className="newCustomer-form">
          <p>Basic Details</p>
          <form>
            <div className="form-group">
              <label>
                Name <span>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                placeholder="Name..."
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                placeholder="Phone number..."
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                placeholder="Email..."
              />
            </div>

            {/* <div className="form-group">
              <p>Company Details (Optional)</p>
              <label>GSTIN</label>
              <input
                type="text"
                name="gstin"
                value={userData.gstin}
                onChange={handleInputChange}
                placeholder="GSTIN..."
              />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={userData.companyName}
                onChange={handleInputChange}
                placeholder="Company Name..."
              />
            </div>

            <div className="form-group">
              <label>Billing Address</label>
              <span className="address" onClick={() => setOpenAdd(true)}>
                <CirclePlus /> Billing Address
              </span>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCustomer;
