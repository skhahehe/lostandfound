import React from "react";
import { useNavigate } from "react-router-dom";

const InfoPage = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="info-page-container">
      <div className="info-card">
        <h2>{title}</h2>
        <p>Nothing added yet...</p>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    </div>
  );
};

export default InfoPage;
