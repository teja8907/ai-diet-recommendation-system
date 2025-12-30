import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./HomeHero.css";

export default function HomeHero() {
  const navigate = useNavigate();

  // 🔹 nutrition status state
  const [status, setStatus] = useState(null);

  // 🔹 fetch today's nutrition status
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    fetch(`https://ai-diet-recommendation-system.onrender.com/today-nutrition-status?date=${today}`)
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => {});
  }, []);

  return (
    <div className="hero">
      {/* ℹ️ ABOUT ICON */}
      <div
        className="about-icon fade-slide"
        title="About Goodie Foodie"
        onClick={() => navigate("/about")}
      >
        ℹ️
      </div>

      <h1 className="fade-slide">
        Eat Smart with <span>AI</span>
      </h1>

      <p className="hero-subtitle fade-slide fade-delay-1">
        Personalized diet plans and healthy recipes designed just for you.
      </p>

      {/* MAIN BUTTON ROW */}
      <div className="hero-buttons-row fade-slide fade-delay-2">
        {/* AI DIET PLANNER */}
        <button
          className="hero-btn primary"
          onClick={() => navigate("/diet-planner")}
        >
          🥗 AI Diet Planner
        </button>

        {/* RANDOM RECIPES */}
        <button
          className="hero-btn secondary"
          onClick={() => navigate("/random-recipe")}
        >
          🎲 Discover Random Recipes
        </button>

        {/* TRACK + FOODIE FIXER */}
        <div className="tracker-group">
          <button
            className="hero-btn secondary"
            onClick={() => navigate("/track-nutrition")}
          >
            📊 Track My Nutrition
          </button>

          <button
            className="foodie-fixer-btn"
            onClick={() =>
              navigate("/track-nutrition", {
                state: { from: "foodie-fixer" },
              })
            }
          >
            🤖 Foodie Fixer
          </button>
        </div>
      </div>

      {/* 🥗 DAILY NUTRITION FOCUS (DYNAMIC) */}
      <div className="nutrition-focus fade-slide fade-delay-3">
        <h3>Daily Nutrition Focus</h3>

        <div className="focus-cards">
          {/* Protein */}
          <div
            className={`focus-card ${
              status?.protein_status === "low" ? "low" : ""
            }`}
          >
            💪
            <h4>Protein</h4>
            <p>
              {status?.protein_status === "low"
                ? "Low intake ⚠️"
                : "Sufficient ✅"}
            </p>
          </div>

          {/* Iron */}
          <div
            className={`focus-card ${
              status?.iron_status === "low" ? "low" : ""
            }`}
          >
            🩸
            <h4>Iron</h4>
            <p>
              {status?.iron_status === "low"
                ? "Deficiency risk"
                : "Normal"}
            </p>
          </div>

          {/* Calcium */}
          <div
            className={`focus-card ${
              status?.calcium_status === "low" ? "low" : ""
            }`}
          >
            🦴
            <h4>Calcium</h4>
            <p>
              {status?.calcium_status === "low"
                ? "Needs attention"
                : "Good"}
            </p>
          </div>

          {/* Carbs */}
          <div className="focus-card">
            🍞
            <h4>Carbs</h4>
            <p>Energy source</p>
          </div>
        </div>
      </div>
    </div>
  );
}
