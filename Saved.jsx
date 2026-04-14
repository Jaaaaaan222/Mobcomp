import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getRecipes } from "../services/recipes";

export default function Saved() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    getRecipes().then(setRecipes);
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Saved Recipes</h2>

      {recipes.map((r) => (
        <div key={r.id}>
          <p>{r.name}</p>
        </div>
      ))}
    </div>
  );
}