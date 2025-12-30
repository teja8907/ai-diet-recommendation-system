from fastapi import FastAPI
from sklearn.cluster import KMeans

from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os

# -------------------------------
# APP INIT (MUST BE FIRST)
# -------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# LOAD DATASET (CORRECT PATH)
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
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
# JUNK FILTER
# -------------------------------
JUNK_KEYWORDS = (
    "biscuit|cookie|pastry|cake|icing|dessert|sweet|flan|"
    "chocolate|mithai|halwa|laddu|barfi|toffee"
)

# -------------------------------
# MEAL RECOMMENDER (STRICT & FAST)
# -------------------------------
def recommend_meal(calories, diet):

    data = df.copy()

    # DIET FILTER
    if diet == "veg":
        data = data[~data["Dish Name"].str.contains(
            "chicken|mutton|fish|prawn|egg", case=False, na=False)]
    elif diet == "non-veg":
        data = data[data["Dish Name"].str.contains(
            "chicken|mutton|fish|prawn|egg", case=False, na=False)]

    # REMOVE JUNK
    data = data[~data["Dish Name"].str.contains(
        JUNK_KEYWORDS, case=False, na=False)]

    # NUTRITION RULES
    data = data[
        (data["Protein (g)"] >= 8) &
        (data["Free Sugar (g)"] <= 5) &
        (data["Fats (g)"] <= 30)
    ]

    if data.empty:
        return None

    # 🎯 CALORIE TARGET
    target = calories / 4
    data["diff"] = (data["Calories (kcal)"] - target).abs()

    # ✅ VARIETY LOGIC (CRITICAL)
    top_choices = data.sort_values("diff").head(10)

    meal = top_choices.sample(1).iloc[0]

    return {
        "dish": meal["Dish Name"],
        "calories": round(meal["Calories (kcal)"], 2),
        "protein": round(meal["Protein (g)"], 2),
        "carbs": round(meal["Carbohydrates (g)"], 2),
        "fats": round(meal["Fats (g)"], 2),
    }


# -------------------------------
# DAILY PLAN
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

# -------------------------------
# WEEKLY PLAN
# -------------------------------
@app.get("/weekly-plan")
def weekly_plan(age: int, height: float, weight: float, goal: str, diet: str):
    return [
        {
            "day": f"Day {d}",
            "meals": daily_plan(age, height, weight, goal, diet)["meals"]
        }
        for d in range(1, 8)
    ]

# -------------------------------
# MONTHLY PLAN
# -------------------------------
@app.get("/monthly-plan")
def monthly_plan(age: int, height: float, weight: float, goal: str, diet: str):
    return [
        {
            "week": f"Week {w}",
            "days": [
                {
                    "day": f"Day {d}",
                    "meals": daily_plan(age, height, weight, goal, diet)["meals"]
                }
                for d in range(1, 8)
            ]
        }
        for w in range(1, 5)
    ]
@app.get("/random-recipes")
def random_recipes(count: int = 6, diet: str = "all"):
    data = df.copy()

    # Diet filter
    if diet == "veg":
        data = data[~data["Dish Name"].str.contains(
            "chicken|mutton|fish|prawn|egg", case=False, na=False)]

    elif diet == "non-veg":
        data = data[data["Dish Name"].str.contains(
            "chicken|mutton|fish|prawn|egg", case=False, na=False)]

    # Remove junk
    data = data[~data["Dish Name"].str.contains(
        JUNK_KEYWORDS, case=False, na=False)]

    if data.empty:
        return []

    sample = data.sample(min(count, len(data)))

    recipes = []
    for _, r in sample.iterrows():
        recipes.append({
            "dish": r["Dish Name"],
            "calories": round(r["Calories (kcal)"], 2),
            "protein": round(r["Protein (g)"], 2),
            "carbs": round(r["Carbohydrates (g)"], 2),
            "fats": round(r["Fats (g)"], 2),
        })

    return recipes
@app.get("/random-recipe")
def random_recipe():
    row = df.sample(1).iloc[0]

    return {
        "dish": row["Dish Name"],
        "calories": round(row["Calories (kcal)"], 2),
        "protein": round(row["Protein (g)"], 2),
        "carbs": round(row["Carbohydrates (g)"], 2),
        "fats": round(row["Fats (g)"], 2)
    }
@app.get("/random-recipe")
def random_recipe(goal: str, diet: str):

    data = df.copy()

    # Diet filter
    if diet == "veg":
        data = data[~data["Dish Name"].str.contains(
            "chicken|mutton|fish|prawn|egg", case=False, na=False)]
    else:
        data = data[data["Dish Name"].str.contains(
            "chicken|mutton|fish|prawn|egg", case=False, na=False)]

    # Junk filter
    data = data[~data["Dish Name"].str.contains(
        JUNK_KEYWORDS, case=False, na=False)]

    if data.empty:
        return {"error": "No recipe found"}

    recipe = data.sample(1).iloc[0]

    return {
        "dish": recipe["Dish Name"],
        "calories": round(recipe["Calories (kcal)"], 2),
        "protein": round(recipe["Protein (g)"], 2),
        "carbs": round(recipe["Carbohydrates (g)"], 2),
        "fats": round(recipe["Fats (g)"], 2),
    }
@app.get("/ai-assistant")
def ai_assistant(goal: str, diet: str):

    data = df.copy()

    # Diet filter
    if diet == "veg":
        data = data[~data["Dish Name"].str.contains(
            "chicken|mutton|fish|egg|prawn", case=False, na=False
        )]

    # Goal → cluster logic (ML usage)
    if goal == "lose":
        preferred_cluster = "Low Calorie"
    elif goal == "gain":
        preferred_cluster = "High Protein"
    else:
        preferred_cluster = "Balanced"

    data["cluster_name"] = data["cluster"].map(CLUSTER_MAP)
    data = data[data["cluster_name"] == preferred_cluster]

    meal = data.sample(1).iloc[0]

    return {
        "dish": meal["Dish Name"],
        "cluster": preferred_cluster,
        "calories": round(meal["Calories (kcal)"], 2),
        "protein": round(meal["Protein (g)"], 2),
        "message": f"I selected this from the {preferred_cluster} food group using Machine Learning."
    }

