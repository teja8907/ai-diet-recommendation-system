import { useNavigate } from "react-router-dom";
import "./HomeHero.css";

export default function HomeHero() {
  const navigate = useNavigate();

  return (
    <div className="hero">
      <h1>
        Eat Smart with <span>AI</span>
      </h1>

      <p className="hero-subtitle">
        Personalized diet plans and healthy recipes designed just for you.
      </p>

      {/* MAIN BUTTONS */}
      <div className="hero-buttons">
        <button
          className="primary-btn"
          onClick={() => navigate("/diet-planner")}
        >
          🥗 AI Diet Planner
        </button>

        <button
          className="secondary-btn"
          onClick={() => navigate("/random-recipe")}
        >
          🎲 Discover Random Recipes
        </button>
      </div>

      {/* NUTRITION HIGHLIGHTS */}
      <div className="nutrition-section">
        <h2>Daily Nutrition Focus</h2>

        <div className="nutrition-cards">
          <div className="nutrition-card">
            <span>🔥</span>
            <h3>Calories</h3>
            <p>Balanced intake</p>
          </div>

          <div className="nutrition-card">
            <span>💪</span>
            <h3>Protein</h3>
            <p>Muscle & strength</p>
          </div>

          <div className="nutrition-card">
            <span>🥗</span>
            <h3>Carbs</h3>
            <p>Energy source</p>
          </div>

          <div className="nutrition-card">
            <span>🧈</span>
            <h3>Fats</h3>
            <p>Healthy balance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
