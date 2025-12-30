import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import DietPlannerPage from "./pages/DietPlannerPage";
import Recipes from "./pages/Recipes";
import RandomRecipe from "./pages/RandomRecipe";

function App() {
  return (
    <BrowserRouter>
      <Navbar />   {/* ✅ ONLY HERE */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diet-planner" element={<DietPlannerPage />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/random-recipe" element={<RandomRecipe />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
