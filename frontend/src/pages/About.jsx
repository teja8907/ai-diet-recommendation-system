import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./About.css";

export default function About() {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="about-page">
      {/* BACK */}
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      <h1 className="about-title">
        About <span>Goodie Foodie</span> 🥗
      </h1>

      <p className="about-subtitle">
        An AI-powered nutrition assistant that helps you eat smarter every day.
      </p>

      {/* FLOW DIAGRAM */}
      <div className="flow-container">
        <div className="flow-step">
          <div className="icon-circle">🍽️</div>
          <p>User enters meal</p>
        </div>

        <div className="arrow">→</div>

        <div className="flow-step">
          <div className="icon-circle">🤖</div>
          <p>Foodie Fixer AI</p>
        </div>

        <div className="arrow">→</div>

        <div className="flow-step">
          <div className="icon-circle">📊</div>
          <p>Nutrition calculated</p>
        </div>

        <div className="arrow">→</div>

        <div className="flow-step">
          <div className="icon-circle">🩺</div>
          <p>Protein / Iron / Calcium check</p>
        </div>

        <div className="arrow">→</div>

        <div className="flow-step">
          <div className="icon-circle">💡</div>
          <p>Smart suggestions</p>
        </div>

        <div className="arrow">→</div>

        <div className="flow-step">
          <div className="icon-circle">🗓️</div>
          <p>Saved to tracker</p>
        </div>
      </div>

      {/* WHY */}
      <div className="about-info">
        <h3>Why Goodie Foodie?</h3>
        <ul>
          <li>✔ Uses real Indian food dataset</li>
          <li>✔ Tracks daily nutrition automatically</li>
          <li>✔ Highlights protein, iron & calcium gaps</li>
          <li>✔ Beginner-friendly & AI-powered</li>
        </ul>
      </div>

      {/* FLOATING CONTACT BUTTON */}
      <div
        className="contact-fab"
        onClick={() => setShowContact((prev) => !prev)}
      >
        📩
      </div>

      {/* CONTACT POPUP (TOGGLE) */}
      {showContact && (
        <div className="contact-popup">
          <h3>Contact Goodie Foodie</h3>
          <p>Have feedback or questions?</p>

          <ul>
            <li>
              📧 Email:{" "}
              <a href="mailto:goodiefoodie.ai@gmail.com">
                goodiefoodie.ai@gmail.com
              </a>
            </li>
            <li>📍 Academic Project</li>
            <li>💬 Open to suggestions</li>
          </ul>
        </div>
      )}
    </div>
  );
}
