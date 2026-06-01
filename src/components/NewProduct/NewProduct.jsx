import "./NewProduct.scss";

import { RxCross2 } from "react-icons/rx";
import { ArrowRight, CirclePlus } from "lucide-react";
import { baseUrl } from "../../main";
import axios from "axios";
import LoadingButton from "../LoadingButton/LoadingButton";
import { useState } from "react";
import { toast } from "sonner";

const NewProduct = ({ setOpenProduct, handleProductData }) => {
  const handleClose = () => {
    setOpenProduct(false);
  };

  const [isLoading, setIsLoading] = useState(false);

  const [productData, setProductData] = useState({
    name: "",
    price: "",
    unit: "",
    discount: "",
    totalAmount: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${baseUrl}/product/new-product`,
        productData,
        { withCredentials: true },
      );

      if (data && data.product) {
        toast.success(data.message);
        setOpenProduct(false);
        handleProductData(data.product);
      }
      handleClose();
    } catch (error) {
      console.error("Error saving product data", error);
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="newProduct">
      <div className="newProduct-container">
        <div className="newProduct-top">
          <div className="newProduct-top-left">
            <RxCross2
              className="cross-icon"
              onClick={handleClose} // Cross icon click
            />
            <h2>Add Product</h2>
          </div>

          <LoadingButton isLoading={isLoading} onClick={handleSave}>
            Save <ArrowRight size={20} />
          </LoadingButton>
        </div>

        <div className="newProduct-form">
          <p>Basic Details</p>
          <form action="">
            <div className="form-group">
              <label htmlFor="">
                <span>*</span>Name
              </label>
              <input
                type="text"
                name="name"
                id=""
                placeholder="item name..."
                value={productData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="">Selling Price</label>
              <input
                type="number"
                name="price"
                id=""
                placeholder="selling price..."
                value={productData.price}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="">Pimary Unit</label>
              <input
                type="number"
                name="unit"
                id=""
                placeholder="unit..."
                value={productData.unit}
                onChange={handleInputChange}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewProduct;
