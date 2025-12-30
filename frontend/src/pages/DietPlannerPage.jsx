import { useState } from "react";
import API_BASE_URL from "../api";

import "../components/DietPlanner.css";
export default function DietPlanner() {
  const [form, setForm] = useState({
    age: "",
    height: "",
    weight: "",
    goal: "maintain",
    diet: "veg",
  });

  const [tab, setTab] = useState("daily");
  const [daily, setDaily] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generate = async () => {
    const { age, height, weight, goal, diet } = form;

    if (!age || !height || !weight) {
      alert("Please enter age, height and weight");
      return;
    }

    setLoading(true);
    const q = `age=${age}&height=${height}&weight=${weight}&goal=${goal}&diet=${diet}`;

    try {
      const d = await fetch(`${API_BASE_URL}/daily-plan?${q}`).then(r => r.json());
const w = await fetch(`${API_BASE_URL}/weekly-plan?${q}`).then(r => r.json());
const m = await fetch(`${API_BASE_URL}/monthly-plan?${q}`).then(r => r.json());


      setDaily(d);
      setWeekly(w);
      setMonthly(m);
    } catch (err) {
      console.error(err);
      alert("Backend not responding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diet-page">
      <h1 className="title">AI Diet Planner</h1>
      <p className="subtitle">
        Personalized diet plans with healthy food recommendations
      </p>

      {/* FORM */}
      <div className="form-card">
        <input type="number" name="age" placeholder="Age" onChange={handleChange} />
        <input type="number" name="height" placeholder="Height (cm)" onChange={handleChange} />
        <input type="number" name="weight" placeholder="Weight (kg)" onChange={handleChange} />

        {/* DIET TOGGLE */}
        <div className="diet-toggle">
          <button
            type="button"
            className={form.diet === "veg" ? "active" : ""}
            onClick={() => setForm(p => ({ ...p, diet: "veg" }))}
          >
            🥦 Veg
          </button>
          <button
            type="button"
            className={form.diet === "non-veg" ? "active" : ""}
            onClick={() => setForm(p => ({ ...p, diet: "non-veg" }))}
          >
            🍗 Non-Veg
          </button>
        </div>

        <select name="goal" onChange={handleChange}>
          <option value="lose">Lose</option>
          <option value="maintain">Maintain</option>
          <option value="gain">Gain</option>
        </select>

        <button type="button" onClick={generate}>
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </div>

      {/* TABS */}
      <div className="tabs">
        <button onClick={() => setTab("daily")} className={tab==="daily"?"active":""}>Daily</button>
        <button onClick={() => setTab("weekly")} className={tab==="weekly"?"active":""}>Weekly</button>
        <button onClick={() => setTab("monthly")} className={tab==="monthly"?"active":""}>Monthly</button>
      </div>

      {/* RESULTS */}
      <div className="results">

        {/* DAILY */}
        {tab === "daily" && daily?.meals && (
          <div className="day-card">
            <h3>Today</h3>
            {Object.entries(daily.meals).map(
              ([meal, food]) =>
                food && <Meal key={meal} meal={meal} food={food} />
            )}
          </div>
        )}

        {/* WEEKLY → 2 column */}
        {tab === "weekly" && (
          <div className="days-grid">
            {weekly.map((day, i) => (
              <div key={i} className="day-card">
                <h3>{day.day}</h3>
                {Object.entries(day.meals).map(
                  ([meal, food]) =>
                    food && <Meal key={meal} meal={meal} food={food} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* MONTHLY → week + 2 column days */}
        {tab === "monthly" &&
          monthly.map((week, i) => (
            <div key={i} className="week-block">
              <h2>{week.week}</h2>
              <div className="days-grid">
                {week.days.map((day, j) => (
                  <div key={j} className="day-card">
                    <h4>{day.day}</h4>
                    {Object.entries(day.meals).map(
                      ([meal, food]) =>
                        food && <Meal key={meal} meal={meal} food={food} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

/* MEAL CARD */
function Meal({ meal, food }) {
  return (
    <div className="meal-card">
      <div>
        <b>{meal}</b>
        <p>{food.dish}</p>
        <small>
          Protein {food.protein}g | Carbs {food.carbs}g | Fats {food.fats}g
        </small>
      </div>
      <span className="cal">{food.calories} kcal</span>
    </div>
  );
}