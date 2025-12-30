import { recipes } from "../data/recipes";

export default function Recipes() {
  return (
    <div className="recipes-page">
      <h1>🎲 Discover Recipes</h1>

      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id}>
            <img
              src={recipe.image}
              alt={recipe.name}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />
            <h3>{recipe.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
