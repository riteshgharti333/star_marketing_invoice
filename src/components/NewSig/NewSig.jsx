import "./NewSig.scss";

import { useState } from "react";

import { RxCross2 } from "react-icons/rx";
import { ArrowRight } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { baseUrl } from "../../main";
import { toast } from "sonner";
import LoadingButton from "../LoadingButton/LoadingButton";

const NewSig = ({ setOpensig, handleSigData }) => {
  const [signatureName, setSignatureName] = useState("");
  const [signatureImage, setSignatureImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setOpensig(false);
  };

  const handleSubmit = async () => {
    if (!signatureName || !signatureImage) {
      toast.error("Please enter a signature name and upload a file.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("signatureName", signatureName);
    formData.append("signatureImage", signatureImage);

    try {
      const { data } = await axios.post(
        `${baseUrl}/signature/new-signature`,
        formData,
        { withCredentials: true },
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Signature added successfully!");
      handleSigData(data.signature);
      setOpensig(false);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="newSig">
      <div className="newSig-container">
        <div className="newSig-top">
          <div className="newSig-top-left" onClick={handleClose}>
            <RxCross2 className="cross-icon" />
            <h2>Signature Details</h2>
          </div>

          <div onClick={handleSubmit}>
            <LoadingButton isLoading={isLoading}>
              Save <ArrowRight size={20} />
            </LoadingButton>
          </div>
        </div>

        <div className="newSig-form">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="signatureName">
                <span>*</span>Signature Name
              </label>
              <input
                type="text"
                id="signatureName"
                placeholder="Signature name..."
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signatureImage">
                <span>*</span> Upload
              </label>
              <div className="add-sig">
                <label htmlFor="signatureImage">
                  <FaPlus className="add-sig-icon" />
                  <input
                    type="file"
                    id="signatureImage"
                    accept="image/*"
                    onChange={(e) => setSignatureImage(e.target.files[0])}
                    style={{ display: "none" }}
                  />

                  <p>
                    {signatureImage ? signatureImage.name : "Upload signature"}
                  </p>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewSig;
