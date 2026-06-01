import React from "react";
import "./LoadingButton.scss";

const LoadingButton = ({ isLoading, onClick, children }) => {
  return (
    <button className="loading-btn" onClick={onClick} disabled={isLoading}>
      {isLoading ? <div className="loader"></div> : children}
    </button>
  );
};

export default LoadingButton;
