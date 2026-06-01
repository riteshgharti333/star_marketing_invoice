import { sidebarItems } from "../../assets/data";
import "./BottomBar.scss";
import { Link, useLocation } from "react-router-dom";

export const BottomBar = ({ items }) => {
  const location = useLocation();

  return (
    <div className="bottom-bar">
      {sidebarItems.map((item, index) => {
        const isActive = location.pathname === `/${item.link}`;
        const Icon = item.icon;

        return (
          <Link
            key={index}
            to={`/${item.link}`}
            className={`bottom-bar-item ${isActive ? "active" : ""}`}
          >
            <Icon size={20} />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
};
