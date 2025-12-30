import { useState } from "react";
import { recipes } from "../data/recipes";

import "./RandomRecipe.css";



export default function RandomRecipe() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [selectedRecipe, setSelectedRecipe] = useState(null);

 const filteredRecipes = recipes.filter((recipe) => {
  const matchesFilter =
    filter === "All" ||
    recipe.type === filter ||
    recipe.festival === filter;

  const matchesSearch = recipe.name
    .toLowerCase()
    .includes(search.toLowerCase());

  return matchesFilter && matchesSearch;
});


  return (
    <>
      {/* NAVBAR */}
    

      <div className="recipes-page">
        <h1 className="page-title">Recipes</h1>
        {/* 🔍 SEARCH BAR */}
      <input
        type="text"
        placeholder="Search recipes..."
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        
      />

        {/* FILTER BUTTONS */}
        <div className="filters">
          <button onClick={() => setFilter("All")}>All</button>
          <button onClick={() => setFilter("veg")}>Vegetarian</button>
          <button onClick={() => setFilter("non-veg")}>Non-Veg</button>
        </div>

        {/* GRID */}
        <div className="recipes-grid">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <img
  src={`/images/${recipe.name
    .toLowerCase()
    .replace(/\s+/g, "-")}.jpg`}
  alt={recipe.name}
  className="recipe-img"
  onError={(e) => {
    e.target.src = "/images/placeholder.jpg";
  }}
/>

              <div className="recipe-content">
                <span className="tag">{recipe.type}</span>
                <h3>{recipe.name}</h3>

                <p>🔥 {recipe.calories} kcal</p>
                <p>💪 {recipe.protein} g protein</p>

                <button
                  className="view-btn"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  View Recipe
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* VIEW RECIPE MODAL */}
        {selectedRecipe && (
          <div className="modal">
            <div className="modal-box">
              <h2>{selectedRecipe.name}</h2>
              <p>
                {selectedRecipe.type.toUpperCase()} • 🔥{" "}
                {selectedRecipe.calories} kcal
              </p>

              <h3>👩‍🍳 How to Make</h3>
              <ol>
                {selectedRecipe.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              <button
                className="close-btn"
                onClick={() => setSelectedRecipe(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
