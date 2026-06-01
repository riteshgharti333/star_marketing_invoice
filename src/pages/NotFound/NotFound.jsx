import "./NotFound.scss";
import { Link } from "react-router-dom";
import { FiHome, FiArrowLeft, FiHelpCircle } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-container">
        {/* 404 Number */}
        <div className="error-code">
          <h1>4</h1>
          <div className="zero">
            <div className="zero-ring"></div>
            <div className="zero-circle"></div>
          </div>
          <h1>4</h1>
        </div>

        {/* Content */}
        <div className="error-content">
          <h2>Page Not Found</h2>
          <p>
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="button-group">
            <Link to="/" className="btn btn-primary">
              <FiHome /> Back to Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary"
            >
              <FiArrowLeft /> Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
