import { useState } from "react";
import { recipes } from "../data/recipes";
import "./NutritionAI.css";

export default function NutritionAI() {
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [result, setResult] = useState(null);

  const recommend = () => {
    let best = null;
    let bestScore = -1;
    let explanation = [];

    recipes.forEach((r) => {
      let score = 0;
      let reasons = [];

      if (protein && r.protein >= protein) {
        score += 2;
        reasons.push(`High protein (${r.protein}g)`);
      }
      if (carbs && r.carbs <= carbs) {
        score += 2;
        reasons.push(`Low carbs (${r.carbs}g)`);
      }
      if (fats && r.fats <= fats) {
        score += 1;
        reasons.push(`Controlled fats (${r.fats}g)`);
      }

      if (score > bestScore) {
        bestScore = score;
        best = r;
        explanation = reasons;
      }
    });

    setResult(best ? { recipe: best, explanation } : null);
  };

  return (
    <div className="ai-card">
      <h2>🤖 Nutrition AI Assistant</h2>
      <p className="ai-sub">
        Enter nutrition goals — I’ll recommend a recipe and explain why.
      </p>

      <div className="ai-inputs">
        <input
          type="number"
          placeholder="Min Protein (g)"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Carbs (g)"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Fats (g)"
          value={fats}
          onChange={(e) => setFats(e.target.value)}
        />
      </div>

      <button onClick={recommend}>Recommend Recipe</button>

      {result && (
        <div className="ai-result">
          <h3>{result.recipe.name}</h3>
          <p>
            🔥 {result.recipe.calories} kcal | 💪 {result.recipe.protein}g |
            🥗 {result.recipe.carbs}g | 🧈 {result.recipe.fats}g
          </p>

          <h4>Why this recipe?</h4>
          <ul>
            {result.explanation.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
