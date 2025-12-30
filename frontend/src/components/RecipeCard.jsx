export default function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <img
        src={recipe.image}
        alt={recipe.name}
        style={{ width: "100%", borderRadius: "12px" }}
      />
      <h3>{recipe.name}</h3>
      <p>🔥 {recipe.calories} kcal</p>
    </div>
  );
}
