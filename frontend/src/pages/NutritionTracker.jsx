import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useLocation } from "react-router-dom";
import "./NutritionTracker.css";

/* ================= PIE CHART ================= */
function SimplePieChart({ data }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  let cumulative = 0;
  const colors = ["#b76e79", "#f4a261", "#6a994e"];

  return (
    <svg width="180" height="180" viewBox="0 0 36 36">
      {data.map((slice, i) => {
        const value = slice.value / total;
        const dashArray = `${value * 100} ${100 - value * 100}`;
        const dashOffset = 25 - cumulative * 100;
        cumulative += value;

        return (
          <circle
            key={i}
            cx="18"
            cy="18"
            r="15.9"
            fill="transparent"
            stroke={colors[i]}
            strokeWidth="3.2"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}


/* ================= MAIN COMPONENT ================= */

export default function NutritionTracker() {
  const location = useLocation();
  const fromFoodieFixer = location.state?.from === "foodie-fixer";

  const [foodieText, setFoodieText] = useState("");
  const [foodieTips, setFoodieTips] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [savedDates, setSavedDates] = useState([]);

  const [step, setStep] = useState(1);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [nutrition, setNutrition] = useState(null);

  const dateStr = selectedDate.toISOString().split("T")[0];

  /* ---------- FETCH SAVED DATES ---------- */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/nutrition-dates")
      .then((res) => res.json())
      .then((data) => setSavedDates(data.dates || []))
      .catch(() => {});
  }, []);

  /* ---------- FETCH DATA BY DATE ---------- */
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/nutrition-by-date?log_date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.protein > 0) {
          setProtein(data.protein);
          setCarbs(data.carbs);
          setFats(data.fats);
          setNutrition([
            { name: "Protein", value: data.protein },
            { name: "Carbs", value: data.carbs },
            { name: "Fats", value: data.fats },
          ]);
        } else {
          resetForm();
        }
      })
      .catch(() => resetForm());
  }, [dateStr]);

  const resetForm = () => {
    setProtein(0);
    setCarbs(0);
    setFats(0);
    setNutrition(null);
    setStep(1);
  };

  /* ---------- FOODIE FIXER ---------- */
  const handleFoodieFix = async () => {
    const res = await fetch("http://127.0.0.1:8000/foodie-fixer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: foodieText }),
    });

    const data = await res.json();

    if (!data?.protein) {
      alert("❌ Couldn't recognize food. Try: idli, rice, dal");
      return;
    }

    setProtein(data.protein);
    setCarbs(data.carbs);
    setFats(data.fats);
    setFoodieTips(data.tips || []);

    setNutrition([
      { name: "Protein", value: data.protein },
      { name: "Carbs", value: data.carbs },
      { name: "Fats", value: data.fats },
    ]);

    await saveToBackend(data.protein, data.carbs, data.fats);
  };

  /* ---------- SAVE ---------- */
  const saveNutrition = async () => {
    await saveToBackend(protein, carbs, fats);

    setNutrition([
      { name: "Protein", value: protein },
      { name: "Carbs", value: carbs },
      { name: "Fats", value: fats },
    ]);

    setStep(1);
  };

  const saveToBackend = async (p, c, f) => {
    await fetch("http://127.0.0.1:8000/log-nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        log_date: dateStr,
        protein: p,
        carbs: c,
        fats: f,
        calories: p * 4 + c * 4 + f * 9,
      }),
    });

    setSavedDates((prev) =>
      prev.includes(dateStr) ? prev : [...prev, dateStr]
    );
  };

  return (
    <div className="tracker-page">
      {/* HEADER */}
      <div className="tracker-header">
        <div>
          <h2>📊 Nutrition Tracker</h2>
          <p className="selected-date">{selectedDate.toDateString()}</p>
        </div>
        <button className="calendar-btn" onClick={() => setCalendarOpen(!calendarOpen)}>
          📅
        </button>
      </div>

      <div className="tracker-card">
        {/* FOODIE FIXER */}
        {fromFoodieFixer && (
          <div className="foodie-message">
            <textarea
              className="foodie-input"
              placeholder="Eg: 2 idlis, sambar, coffee..."
              value={foodieText}
              onChange={(e) => setFoodieText(e.target.value)}
            />
            <button className="foodie-action-btn" onClick={handleFoodieFix}>
              🍽️ Fix My Meal
            </button>
          </div>
        )}

        {/* FORM */}
        <div className="food-form">
          {step === 1 && (
            <>
              <h3>🥗 Protein (g)</h3>
              <input type="number" value={protein} onChange={(e) => setProtein(+e.target.value)} />
              <button onClick={() => setStep(2)}>Next</button>
            </>
          )}

          {step === 2 && (
            <>
              <h3>🍞 Carbs (g)</h3>
              <input type="number" value={carbs} onChange={(e) => setCarbs(+e.target.value)} />
              <button onClick={() => setStep(3)}>Next</button>
            </>
          )}

          {step === 3 && (
            <>
              <h3>🥑 Fats (g)</h3>
              <input type="number" value={fats} onChange={(e) => setFats(+e.target.value)} />
              <button onClick={saveNutrition}>Save</button>
            </>
          )}
        </div>

        {/* PIE + LEGEND */}
        {nutrition && (
          <div className="chart-wrapper">
            <SimplePieChart data={nutrition} />

            <ul className="legend">
              <li><span className="dot protein"></span> Protein – {protein} g</li>
              <li><span className="dot carbs"></span> Carbs – {carbs} g</li>
              <li><span className="dot fats"></span> Fats – {fats} g</li>
            </ul>
          </div>
        )}

        {/* AI TIPS */}
        {foodieTips.length > 0 && (
          <div className="ai-feedback">
            <h4>🤖 Foodie Fixer Suggestions</h4>
            <ul>
              {foodieTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* CALENDAR */}
      {calendarOpen && (
        <div className="calendar-popup">
          <Calendar
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setCalendarOpen(false);
            }}
            tileClassName={({ date }) =>
              savedDates.includes(date.toISOString().split("T")[0])
                ? "marked-day"
                : null
            }
          />
        </div>
      )}
    </div>
  );
}
