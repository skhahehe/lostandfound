// const API_URL = import.meta.env.VITE_API_URL;
// const BASE_URL = import.meta.env.VITE_API_URL;
import { useState, useRef, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import Lost from "./Lost.jsx";
import Report from "./Report.jsx";
import ItemDetails from "./details.jsx";
import InfoPage from "./InfoPage.jsx";
import SignUp from "./SignUp.jsx";
import "./../Styling/App.css";

const BASE_URL = "https://lostandfound-jade.vercel.app/";
const images = import.meta.glob("./assets/*.{png,jpg,jpeg}", {
  eager: true,
});
const img = Object.fromEntries(
  Object.entries(images).map(([path, module]) => {
    const fileName = path.split("/").pop().split(".")[0];
    return [fileName, module.default];
  })
);

export default function App() {
  const [Search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [item, setItem] = useState("Report Lost Item");
  const [showSearch, setShowSearch] = useState(false);
  const [lostItem, setLostProject] = useState([]);
  const [FoundItem, setFoundItem] = useState([]);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  //////
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false); // 👈 hide search input when clicked outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //////////////
  // const fetchLostItems = () => {
  //   fetch(`${BASE_URL}/api/lost`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const lostWithType = data.items.map((item) => ({
  //         ...item,
  //         type: "lost",
  //       }));
  //       setLostProject(lostWithType);
  //     })
  //     .catch((err) => console.error(err));
  // };
  const fetchLostItems = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/lost`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Expected JSON but received HTML");
      }
      const data = await res.json();
      const lostWithType = data.items.map((item) => ({
        ...item,
        type: "lost",
      }));
      setLostProject(lostWithType);
    } catch (err) {
      console.error("Error fetching lost items:", err);
    }
  };

  const fetchFoundItems = () => {
    fetch(`${BASE_URL}/api/found`)
      .then((res) => res.json())
      .then((data) => {
        const lostWithType = data.items.map((item) => ({
          ...item,
          type: "found",
        }));
        setFoundItem(lostWithType);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchLostItems();
    fetchFoundItems();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    setMenuOpen(false);
    if (path === "/lost") setItem("Report Lost Item");
    else if (path === "/found") setItem("Found anything new?...");
    navigate(path);
  };

  const handleReportClick = () => {
    if (item) navigate("/report");
  };

  return (
    <>
      <header className="header">
        <div className="menu-box" ref={menuRef}>
          <div className="menu-header" onClick={() => setMenuOpen(!menuOpen)}>
            ☰ Menu
          </div>
          {menuOpen && (
            <div className="menu-options">
              <button 
                className={location.pathname === "/contact" ? "active" : ""} 
                onClick={() => handleNavigate("/contact")}
              >
                📞 Contact Us
              </button>
              <button 
                className={location.pathname === "/about" ? "active" : ""} 
                onClick={() => handleNavigate("/about")}
              >
                ℹ️ About
              </button>
              <button 
                className={location.pathname === "/help" ? "active" : ""} 
                onClick={() => handleNavigate("/help")}
              >
                ❓ Help
              </button>
            </div>
          )}
        </div>

        <div className="center-header">
          {(location.pathname === "/lost" ||
            location.pathname === "/found") && (
            <div className="quick-switch">
              <button
                className={`switch-btn ${
                  location.pathname === "/lost" ? "active" : ""
                }`}
                onClick={() => handleNavigate("/lost")}
              >
                Lost
              </button>
              <button
                className="report-btn-header"
                onClick={handleReportClick}
                aria-label={item}
                title={item}
              >
                +
              </button>
              <button
                className={`switch-btn ${
                  location.pathname === "/found" ? "active" : ""
                }`}
                onClick={() => handleNavigate("/found")}
              >
                Found
              </button>
            </div>
          )}
        </div>
        {/* ///////////////////////// */}
        {(location.pathname === "/lost" || location.pathname === "/found") && (
          <div
            className={`search-container ${
              showSearch ? "expanded" : "collapsed"
            }`}
            ref={searchRef}
          >
            {!showSearch ? (
              <button
                className="search-icon"
                onClick={() => setShowSearch(true)}
                title="Search"
              >
                🔍
              </button>
            ) : (
              <div className="search-popup">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search item..."
                  value={Search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => setShowSearch(false)}
                />
              </div>
            )}

            <div className="sort-container">
              <select
                id="sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="">Random</option>
                <option value="ascending">Sort by: A → Z</option>
                <option value="descending">Sort by: Z → A</option>
              </select>
            </div>

            <button
              className="auth-link"
              type="button"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
        )}

        {location.pathname === "/signup" && (
          <button
            className="menu-header home-menu-btn"
            type="button"
            onClick={() => navigate("/lost")}
            aria-label="Home"
            title="Home"
          >
            🏠
          </button>
        )}
      </header>

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/lost" replace />}
        />
        <Route
          path="/lost"
          element={
            <Lost
              search={Search}
              sortOrder={sortOrder}
              projects={lostItem}
              item={item}
            />
          }
        />
        <Route
          path="/found"
          element={
            <Lost
              search={Search}
              sortOrder={sortOrder}
              projects={FoundItem}
              item={item}
            />
          }
        />
        <Route
          path="/details/:id"
          element={
            <ItemDetails
              projects={item === "Report Lost Item" ? lostItem : FoundItem}
            />
          }
        />
        <Route
          path="/report"
          element={
            <Report
              setProject={setLostProject}
              setFoundItem={setFoundItem}
              item={item == "Report Lost Item" ? "Lost" : "Found"}
              fetchLostItems={fetchLostItems}
              fetchFoundItems={fetchFoundItems}
            />
          }
        />
        <Route path="/contact" element={<InfoPage title="Contact Us" />} />
        <Route path="/about" element={<InfoPage title="About Us" />} />
        <Route path="/help" element={<InfoPage title="Help Center" />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </>
  );
}
