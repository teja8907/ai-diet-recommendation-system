import { useState } from "react";
import { recipes } from "../data/recipes";
import "./AIAssistant.css";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);

  const [goal, setGoal] = useState("lose");
  const [diet, setDiet] = useState("veg");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  const [result, setResult] = useState(null);

  const recommend = () => {
    if (!protein || !carbs || !fats) {
      alert("Enter protein, carbs and fats");
      return;
    }

    const filtered = recipes.filter(r => r.type === diet);

    let best = null;
    let minScore = Infinity;

    filtered.forEach(r => {
      const score =
        Math.abs(r.protein - protein) +
        Math.abs(r.carbs - carbs) +
        Math.abs(r.fats - fats);

      if (score < minScore) {
        minScore = score;
        best = r;
      }
    });

    setResult(best);
  };

  return (
    <>
      {/* 🤖 Floating AI Button */}
      <div className="ai-fab" onClick={() => setOpen(true)}>
        🤖
      </div>

      {/* 🧠 AI Popup */}
      {open && (
        <div className="ai-popup">
          <div className="ai-header">
            <span>Nutrition AI</span>
            <button className="ai-close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <p className="ai-text">
            Hi 👋 Tell me your nutrition goals
          </p>

          <select value={goal} onChange={e => setGoal(e.target.value)}>
            <option value="lose">Lose Weight</option>
            <option value="maintain">Maintain</option>
            <option value="gain">Gain Muscle</option>
          </select>

          <select value={diet} onChange={e => setDiet(e.target.value)}>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
          </select>

          <input
            type="number"
            placeholder="Protein (g)"
            value={protein}
            onChange={e => setProtein(Number(e.target.value))}
          />

          <input
            type="number"
            placeholder="Carbs (g)"
            value={carbs}
            onChange={e => setCarbs(Number(e.target.value))}
          />

          <input
            type="number"
            placeholder="Fats (g)"
            value={fats}
            onChange={e => setFats(Number(e.target.value))}
          />

          <button className="ai-btn" onClick={recommend}>
            Recommend Recipe
          </button>

          {result && (
            <div className="ai-result">
              <h4>{result.name}</h4>
              <p>🔥 {result.calories} kcal</p>
              <small>
                Protein {result.protein}g ·
                Carbs {result.carbs}g ·
                Fats {result.fats}g
              </small>
            </div>
          )}
        </div>
      )}
    </>
  );
}
