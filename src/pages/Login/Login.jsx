import "./Login.scss";

import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";

import { baseUrl } from "../../main";
import { useContext, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Context } from "../../Context/Context";

import logo from "../../assets/images/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(Context);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await axios.post(
        `${baseUrl}/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true },
      );

      if (response.data && response.data.result == 1) {
        dispatch({ type: "LOGIN_SUCCESS", payload: response?.data });
        toast.success(response?.data?.message || "Login successful!");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      dispatch({ type: "LOGIN_FAILURE" });

      toast.error(
        error?.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-top">
        <img src={logo} alt="App Logo" />
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to login</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="input-underline"></div>
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              <div className="input-underline"></div>
            </div>

            <button
              type="submit"
              className={`login-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
