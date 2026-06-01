import "./CardProduct.scss";

import { RxCross2 } from "react-icons/rx";
import { ArrowRight, CirclePlus } from "lucide-react";

const CardProduct = ({ setOpenCardProduct, product }) => {
  const handleClose = () => {
    setOpenCardProduct(false);
  };

  return (
    <div className="cardProduct">
      <div className="cardProduct-container">
        <div className="cardProduct-top">
          <div className="cardProduct-top-left">
            <RxCross2
              className="cross-icon"
              onClick={handleClose} // Cross icon click
            />
            <h2>{product.name}</h2>
          </div>

          {/* <button className="primary-btn" onClick={handleClose}>
            Save & Update <ArrowRight size={20} />
          </button> */}
        </div>

        <div className="cardProduct-desc">
          <p className="details">Details</p>
        </div>

        <div className="cardProduct-price">
          <div className="cardProduct-price-item">
            <p>Price</p>
            <span>₹{product.price}</span>
          </div>
          <div className="cardProduct-price-item">
            <p>Sale Amount</p>
            <span>₹{product.price}</span>
          </div>
          <div className="cardProduct-price-item">
            <p>Total Discount</p>
            <span>0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardProduct;
