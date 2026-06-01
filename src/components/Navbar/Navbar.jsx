import { User } from "lucide-react";
import "./Navbar.scss";
import { BiLogIn, BiLogOut } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl } from "../../main";
import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/auth/profile`, {
          withCredentials: true,
        });

        if (data && data.result === 1) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (error.response?.data?.message === "Login required") {
          setUser(null);
        }
        console.error("Profile fetch error:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${baseUrl}/auth/logout`, null, {
        withCredentials: true,
      });

      if (data && data.result == 1) {
        setUser(null);
        toast.success(data.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        {user && (
          <Link to="/profile" className="user-profile">
            <User className="user-icon" />
            <p>{user.name}</p>
          </Link>
        )}
      </div>

      <div className="navbar-right">
        {user ? (
          <button
            className="primary-btn"
            onClick={handleLogout}
            disabled={loading}
          >
            <BiLogOut className="login-icon" />{" "}
            {loading ? "Logging out..." : "Logout"}
          </button>
        ) : (
          <Link to="/login" className="primary-btn">
            <BiLogIn className="login-icon" /> Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
