from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sklearn.cluster import KMeans
import pandas as pd
import sqlite3
import os
import re

# -------------------------------
# APP INIT
# -------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],

)
@app.get("/")
def root():
    return {"status": "Backend is running"}

# -------------------------------
# BASE DIR
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# -------------------------------
# LOAD DATASET
# -------------------------------
DATA_PATH = os.path.join(BASE_DIR, "data", "Indian_Food_Nutrition_Processed.csv")
df = pd.read_csv(DATA_PATH)
df.columns = df.columns.str.strip()

ml_features = df[
    ["Calories (kcal)", "Protein (g)", "Carbohydrates (g)", "Fats (g)"]
].fillna(0)

kmeans = KMeans(n_clusters=3, random_state=42)
df["cluster"] = kmeans.fit_predict(ml_features)

CLUSTER_MAP = {
    0: "Low Calorie",
    1: "Balanced",
    2: "High Protein"
}

# -------------------------------
# DATABASE (DAILY NUTRITION)
# -------------------------------
DB_PATH = os.path.join(BASE_DIR, "nutrition.db")
conn = sqlite3.connect(DB_PATH, check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS daily_nutrition (
    log_date TEXT PRIMARY KEY,
    protein REAL,
    carbs REAL,
    fats REAL,
    calories REAL
)
""")
conn.commit()

# -------------------------------
# JUNK FILTER
# -------------------------------
JUNK_KEYWORDS = (
    "biscuit|cookie|pastry|cake|icing|dessert|sweet|flan|"
    "chocolate|mithai|halwa|laddu|barfi|toffee"
)

# -------------------------------
# MEAL RECOMMENDER
# -------------------------------
def recommend_meal(calories, diet):
    data = df.copy()

    if diet == "veg":
        data = data[~data["Dish Name"].str.contains(
            "chicken|mutton|fish|prawn|egg", case=False, na=False)]
    elif diet == "non-veg":
        data = data[data["Dish Name"].str.contains(
            "chicken|mutton|fish|prawn|egg", case=False, na=False)]

    data = data[~data["Dish Name"].str.contains(
        JUNK_KEYWORDS, case=False, na=False)]

    data = data[
        (data["Protein (g)"] >= 8) &
        (data["Free Sugar (g)"] <= 5) &
        (data["Fats (g)"] <= 30)
    ]

    if data.empty:
        return None

    target = calories / 4
    data["diff"] = (data["Calories (kcal)"] - target).abs()

    meal = data.sort_values("diff").head(10).sample(1).iloc[0]

    return {
        "dish": meal["Dish Name"],
        "calories": round(meal["Calories (kcal)"], 2),
        "protein": round(meal["Protein (g)"], 2),
        "carbs": round(meal["Carbohydrates (g)"], 2),
        "fats": round(meal["Fats (g)"], 2),
    }

# -------------------------------
# DAILY / WEEKLY / MONTHLY PLAN
# -------------------------------
@app.get("/daily-plan")
def daily_plan(age: int, height: float, weight: float, goal: str, diet: str):
    daily_cal = 2000
    if goal == "lose":
        daily_cal -= 300
    elif goal == "gain":
        daily_cal += 300

    return {
        "meals": {
            "Breakfast": recommend_meal(daily_cal, diet),
            "Lunch": recommend_meal(daily_cal, diet),
            "Dinner": recommend_meal(daily_cal, diet),
            "Snack": recommend_meal(daily_cal, diet),
        }
    }

@app.get("/weekly-plan")
def weekly_plan(age: int, height: float, weight: float, goal: str, diet: str):
    return [
        {"day": f"Day {d}", "meals": daily_plan(age, height, weight, goal, diet)["meals"]}
        for d in range(1, 8)
    ]

@app.get("/monthly-plan")
def monthly_plan(age: int, height: float, weight: float, goal: str, diet: str):
    return [
        {
            "week": f"Week {w}",
            "days": [
                {"day": f"Day {d}", "meals": daily_plan(age, height, weight, goal, diet)["meals"]}
                for d in range(1, 8)
            ]
        }
        for w in range(1, 5)
    ]

# -------------------------------
# RANDOM RECIPE
# -------------------------------
@app.get("/random-recipe")
def random_recipe(goal: str, diet: str):
    data = df.copy()

    if diet == "veg":
        data = data[~data["Dish Name"].str.contains(
            "chicken|mutton|fish|prawn|egg", case=False, na=False)]
    else:
        data = data[data["Dish Name"].str.contains(
            "chicken|mutton|fish|prawn|egg", case=False, na=False)]

    data = data[~data["Dish Name"].str.contains(
        JUNK_KEYWORDS, case=False, na=False)]

    recipe = data.sample(1).iloc[0]

    return {
        "dish": recipe["Dish Name"],
        "calories": round(recipe["Calories (kcal)"], 2),
        "protein": round(recipe["Protein (g)"], 2),
        "carbs": round(recipe["Carbohydrates (g)"], 2),
        "fats": round(recipe["Fats (g)"], 2),
    }

# -------------------------------
# AI ASSISTANT
# -------------------------------
@app.get("/ai-assistant")
def ai_assistant(goal: str, diet: str):
    data = df.copy()

    if diet == "veg":
        data = data[~data["Dish Name"].str.contains(
            "chicken|mutton|fish|egg|prawn", case=False, na=False)]

    preferred_cluster = (
        "Low Calorie" if goal == "lose"
        else "High Protein" if goal == "gain"
        else "Balanced"
    )

    data["cluster_name"] = data["cluster"].map(CLUSTER_MAP)
    meal = data[data["cluster_name"] == preferred_cluster].sample(1).iloc[0]

    return {
        "dish": meal["Dish Name"],
        "cluster": preferred_cluster,
        "calories": round(meal["Calories (kcal)"], 2),
        "protein": round(meal["Protein (g)"], 2),
        "message": f"Selected using ML from {preferred_cluster} foods."
    }

# -------------------------------
# 📊 DAILY NUTRITION TRACKER
# -------------------------------
class NutritionLog(BaseModel):
    log_date: str
    protein: float
    carbs: float
    fats: float
    calories: float

@app.post("/log-nutrition")
def log_nutrition(data: NutritionLog):
    cursor.execute("""
        INSERT OR REPLACE INTO daily_nutrition
        VALUES (?, ?, ?, ?, ?)
    """, (
        data.log_date,
        data.protein,
        data.carbs,
        data.fats,
        data.calories
    ))
    conn.commit()
    return {"status": "saved"}

@app.get("/nutrition-by-date")
def nutrition_by_date(log_date: str):
    cursor.execute("""
        SELECT protein, carbs, fats, calories
        FROM daily_nutrition
        WHERE log_date = ?
    """, (log_date,))
    row = cursor.fetchone()

    if row:
        return {
            "protein": row[0],
            "carbs": row[1],
            "fats": row[2],
            "calories": row[3],
        }

    return {"protein": 0, "carbs": 0, "fats": 0, "calories": 0}


@app.delete("/delete-nutrition")
def delete_nutrition(log_date: str):
    cursor.execute(
        "DELETE FROM daily_nutrition WHERE log_date = ?", (log_date,)
    )
    conn.commit()
    return {"status": "deleted"}
@app.get("/monthly-summary")
def monthly_summary(month: str):
    cursor.execute("""
        SELECT SUM(protein), SUM(carbs), SUM(fats), SUM(calories)
        FROM daily_nutrition
        WHERE log_date LIKE ?
    """, (f"{month}%",))
    row = cursor.fetchone()

    return {
        "protein": row[0] or 0,
        "carbs": row[1] or 0,
        "fats": row[2] or 0,
        "calories": row[3] or 0,
    }
@app.get("/nutrition-dates")
def nutrition_dates():
    cursor.execute("""
        SELECT log_date FROM daily_nutrition
    """)
    rows = cursor.fetchall()

    return {
        "dates": [row[0] for row in rows]
    }
class FoodieFixRequest(BaseModel):
    text: str
@app.post("/foodie-fixer")
def foodie_fixer(data: FoodieFixRequest):
    text = data.text.lower()

    matched_rows = []

    for _, row in df.iterrows():
        dish = str(row["Dish Name"]).lower()

        # exact-ish match
        if dish in text:
            matched_rows.append(row)

    # fallback: keyword match (safer)
    if not matched_rows:
        for _, row in df.iterrows():
            dish_words = str(row["Dish Name"]).lower().split()
            if any(word in text for word in dish_words):
                matched_rows.append(row)

    # ❌ nothing matched
    if not matched_rows:
        return {
            "protein": 0,
            "carbs": 0,
            "fats": 0,
            "iron": 0,
            "calcium": 0,
            "tips": []
        }

    # ✅ LIMIT to max 3 items (1 meal)
    matched_rows = matched_rows[:3]

    total_protein = sum(row["Protein (g)"] for row in matched_rows)
    total_carbs = sum(row["Carbohydrates (g)"] for row in matched_rows)
    total_fats = sum(row["Fats (g)"] for row in matched_rows)
    total_iron = sum(row.get("Iron (mg)", 0) for row in matched_rows)
    total_calcium = sum(row.get("Calcium (mg)", 0) for row in matched_rows)

    # -------- SMART TIPS --------
    tips = []

    if total_protein < 15:
        tips.append("Increase protein: add dal, paneer, eggs or curd")
    else:
        tips.append("Good protein intake 👍")

    if total_iron < 6:
        tips.append("Low iron: add spinach, dates, jaggery")

    if total_calcium < 200:
        tips.append("Low calcium: add milk, curd, ragi")

    if total_fats > 25:
        tips.append("High fat: reduce oil & fried foods")

    return {
        "protein": round(total_protein, 2),
        "carbs": round(total_carbs, 2),
        "fats": round(total_fats, 2),
        "iron": round(total_iron, 2),
        "calcium": round(total_calcium, 2),
        "tips": tips
    }
@app.get("/today-nutrition-status")
def today_nutrition_status(date: str):
    cursor.execute("""
        SELECT protein, carbs, fats
        FROM daily_nutrition
        WHERE log_date = ?
    """, (date,))
    row = cursor.fetchone()

    # default if no data
    protein = row[0] if row else 0
    carbs = row[1] if row else 0
    fats = row[2] if row else 0

    # simple thresholds (RDA-inspired)
    return {
        "protein": protein,
        "protein_status": "low" if protein < 50 else "ok",

        "iron_status": "low" if protein < 40 else "ok",   # proxy until full iron tracking
        "calcium_status": "low" if fats < 10 else "ok"    # proxy (temporary)

        # ⬆️ You can later replace these with real iron/calcium table
    }
