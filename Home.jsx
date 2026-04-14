import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import '../Home.css';

import porksinigangExtra1 from '../assets/porksinigang-extra1.webp';
import porkadoboExtra1 from '../assets/porkadobo-extra1.webp';
import porkmenudoExtra1 from '../assets/porkmenudo-extra1.webp';
import chickenadoboExtra1 from '../assets/chickenadobo-extra1.webp';
import shrimpsinigangExtra1 from '../assets/shrimpsinigang-extra1.webp';

import porksinigang from '../assets/porksinigang.png';
import porksinigangExtra from '../assets/porksinigang-extra.webp';
import porksinigangIng from '../assets/sinigang-ing.png';

import addIcon from '../assets/add.png';
import addedIcon from '../assets/added.png';

import porkadobo from '../assets/porkadobo.png';
import porkadoboExtra from '../assets/porkadobo-extra.webp';
import porkadoboIng from '../assets/porkadobo-ing.png';

import porkmenudo from '../assets/porkmenudo.png';
import porkmenudoExtra from '../assets/porkmenudo-extra.webp';
import porkmenudoIng from '../assets/porkmenudo-ing.png';

import chickenadobo from '../assets/chickenadobo.png';
import chickenadoboExtra from '../assets/chickenadobo-extra.webp';
import chickenadoboIng from '../assets/chickenadobo-ing.png';

import shrimpsinigang from '../assets/shrimpsinigang.png';
import shrimpsinigangExtra from '../assets/shrimpsinigang-extra.webp';
import shrimpsinigangIng from '../assets/shrimpsinigang-ing.png';

import chickenafritada from '../assets/chickenafritada.png';
import chickenafritadaExtra from '../assets/chickenafritada-extra.webp';
import chickenafritadaExtra1 from '../assets/chickenafritada-extra1.webp';
import chickenafritadaIng from '../assets/chickenafritada-ing.png';

import bicolexpress from '../assets/bicolexpress.png';
import bicolexpressExtra from '../assets/bicolexpress-extra.webp';
import bicolexpressExtra1 from '../assets/bicolexpress-extra1.webp';
import bicolexpressIng from '../assets/bicolexpress-ing.png';

import backBtnInfo from '../assets/return.png';
import no_recipe from '../assets/no_recipe.png';

export default function Home({ searchQuery }) {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [infoModal, setInfoModal] = useState({ recipe: null, image: null });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);
  

  const expandedRef = useRef(null);


  useEffect(() => {
  const hasSeen = localStorage.getItem("tutorial_choice");

  if (!hasSeen) {
    setTimeout(() => {
      setShowTutorialPrompt(true);
    }, 600);
  }
}, []);

  // Auth listener + clear saved recipes on logout
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const loggedIn = !!user;
      setIsLoggedIn(loggedIn);

      // When user logs out → reset savedRecipes to empty
      if (!loggedIn) {
        setSavedRecipes([]);
        localStorage.removeItem('myCookbook');
      }
    });

    return () => unsubscribe();
  }, []);

  // Load saved recipes – only when logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setSavedRecipes([]); // make sure it's empty when not logged in
      return;
    }

    const loadRecipes = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const cookbookRef = doc(userRef, 'cookbook', 'recipes');
        const snap = await getDoc(cookbookRef);

        if (snap.exists()) {
          const items = snap.data().items || [];
          setSavedRecipes(items);
          localStorage.setItem('myCookbook', JSON.stringify(items));
        } else {
          setSavedRecipes([]);
          localStorage.removeItem('myCookbook');
        }
      } catch (err) {
        console.error("Failed to load from Firestore:", err);
        const stored = JSON.parse(localStorage.getItem('myCookbook') || '[]');
        setSavedRecipes(stored);
      }
    };

    loadRecipes();
  }, [isLoggedIn]);

  // Listen for cookbook changes (only when logged in)
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleCookbookUpdate = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const cookbookRef = doc(userRef, 'cookbook', 'recipes');
        const snap = await getDoc(cookbookRef);

        if (snap.exists()) {
          const freshItems = snap.data().items || [];

          setSavedRecipes(prev => {
            const prevIds = new Set(prev.map(r => r.id));
            const newIds = new Set(freshItems.map(r => r.id));

            if (prevIds.size === newIds.size &&
                [...prevIds].every(id => newIds.has(id))) {
              return prev;
            }

            localStorage.setItem('myCookbook', JSON.stringify(freshItems));
            return freshItems;
          });
        } else {
          setSavedRecipes([]);
          localStorage.removeItem('myCookbook');
        }
      } catch (err) {
        console.error("Reload after update failed:", err);
      }
    };

    window.addEventListener('cookbookUpdated', handleCookbookUpdate);
    return () => window.removeEventListener('cookbookUpdated', handleCookbookUpdate);
  }, [isLoggedIn]);

  const navigate = useNavigate();

const handleTutorialYes = () => {
  localStorage.setItem("tutorial_choice", "yes");
  setShowTutorialPrompt(false);
  navigate("/tutorial");
};

const handleTutorialNo = () => {
  localStorage.setItem("tutorial_choice", "no");
  setShowTutorialPrompt(false);
};

  const isSaved = (id) => savedRecipes.some((recipe) => recipe.id === id);

  const handleAdd = async (recipe) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    if (isSaved(recipe.id)) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const cookbookRef = doc(userRef, 'cookbook', 'recipes');

      const snap = await getDoc(cookbookRef);
      let current = snap.exists() ? snap.data().items || [] : [];

      if (current.some(r => r.id === recipe.id)) return;

      const updated = [...current, recipe];

      if (!snap.exists()) {
        await setDoc(cookbookRef, {
          items: updated,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        await setDoc(cookbookRef, {
          items: updated,
          updatedAt: new Date(),
        }, { merge: true });
      }

      setSavedRecipes(updated);
      localStorage.setItem('myCookbook', JSON.stringify(updated));

      window.dispatchEvent(new Event('cookbookUpdated'));
    } catch (err) {
      console.error("Error saving recipe:", err);
    }
  };

  useEffect(() => {
    document.body.style.overflow =
      infoModal.recipe || infoModal.image || showLoginPrompt ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [infoModal, showLoginPrompt]);

  const nextSlide = (recipe) => {
    setSlideDirection('next');
    setCurrentSlide((prev) => (prev + 1 >= recipe.images.length ? 0 : prev + 1));
  };

  const prevSlide = (recipe) => {
    setSlideDirection('prev');
    setCurrentSlide((prev) => (prev - 1 < 0 ? recipe.images.length - 1 : prev - 1));
  };

  const toggleExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleRecipeModal = (recipe) => {
    setInfoModal({ recipe, image: null });
    setCurrentSlide(0);
  };

  const handleIngredientModal = (image) => {
    setInfoModal({ recipe: null, image });
  };

  // Filter recipes based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery]);

 const recipes = [
    {
      id: 'pork-sinigang-1',
      title: 'Pork Sinigang',
      cover: porksinigang,
      images: [porksinigangExtra, porksinigangExtra1],
      ingredientsImage: porksinigangIng,
      description: 'Pork Sinigang is a classic Filipino sour soup made with pork, vegetables, and tamarind broth.',
      ingredients: [
        "1 kg pork (ribs or belly), cut into chunks",
        "1 medium onion, quartered",
        "2 medium tomatoes, quartered",
        "1 pack tamarind soup base (or 1 cup fresh tamarind juice)",
        "6 cups water",
        "2-3 radishes, sliced",
        "1 cup string beans, trimmed",
        "1 small eggplant, sliced",
        "1 bunch kangkong (water spinach) or spinach",
        "2-3 green chili peppers (optional)",
        "Fish sauce or salt, to taste"
      ]
    },
    {
      id: 'shrimp-sinigang-1',
      title: 'Shrimp Sinigang',
      cover: shrimpsinigang,
      images: [shrimpsinigangExtra, shrimpsinigangExtra1],
      ingredientsImage: shrimpsinigangIng,
      description: 'Shrimp Sinigang is a sour and savory Filipino soup made with fresh shrimp, vegetables, and tamarind broth.',
      ingredients: [
        "large shrimp, cleaned (shell on for more flavor)",
        "6 cups water",
        "1 medium onion, quartered",
        "2 tomatoes, quartered",
        "1 radish (labanos), sliced",
        "1-2 long green chili peppers (siling haba)",
        "1 cup green beans (sitaw), cut into 2-inch pieces",
        "1 cup eggplant, sliced",
        "2 cups kangkong (water spinach)",
        "1 packet tamarind soup mix or ½ cup fresh tamarind pulp (Sinigang Mix)",
        "Fish sauce (patis), to taste",
        "Salt & pepper, to taste"
      ]
    },
    {
      id: 'pork-adobo-1',
      title: 'Pork Adobo',
      cover: porkadobo,
      images: [porkadoboExtra, porkadoboExtra1],
      ingredientsImage: porkadoboIng,
      description: 'Pork Adobo is one of the most popular Filipino dishes cooked in soy sauce, vinegar, garlic, and spices.',
      ingredients: [
        "pork belly or pork shoulder, cut into 2-inch cubes",
        "½ cup soy sauce",
        "½ cup white vinegar",
        "1 cup water",
        "1 head garlic, crushed",
        "2-3 bay leaves (Laurel)",
        "1 tsp whole black peppercorns (Paminta)",
        "1 tbsp brown sugar (optional, for slight sweetness)",
        "1 tbsp cooking oil"
      ]
    },
    {
      id: 'chicken-adobo-1',
      title: 'Chicken Adobo',
      cover: chickenadobo,
      images: [chickenadoboExtra, chickenadoboExtra1],
      ingredientsImage: chickenadoboIng,
      description: 'Chicken Adobo is a savory and tangy Filipino dish made with chicken simmered in soy sauce, vinegar, garlic, bay leaves, and peppercorns.',
      ingredients: [
        "chicken bone-in thighs & drumsticks preferred",
        "½ cup soy sauce",
        "½ cup white vinegar",
        "1 cup water",
        "1 whole head garlic, crushed",
        "2-3 bay leaves",
        "1 tsp whole black peppercorns",
        "1-2 tbsp brown sugar",
        "1 tbsp cooking oil"
      ]
    },
    {
      id: 'pork-menudo-1',
      title: 'Pork Menudo',
      cover: porkmenudo,
      images: [porkmenudoExtra, porkmenudoExtra1],
      ingredientsImage: porkmenudoIng,
      description: 'Pork Menudo is a tomato-based Filipino stew with pork, liver, potatoes, and carrots.',
      ingredients:[
        "pork shoulder or pork belly, cut into small cubes",
        "pork shoulder or pork belly, cut into small cubes",
        "¼ - ½ lb pork liver, diced small",
        "1 cup tomato sauce",
        "2 tbsp tomato paste (optional, for deeper flavor)",
        "1 medium onion, chopped",
        "4 cloves garlic, minced",
        "1 medium potato, diced",
        "1 medium carrot, diced",
        "½ red bell pepper, diced",
        "¼ cup soy sauce",
        "1 cup water or broth",
        "2 tbsp cooking oil",
        "1 tsp sugar (optional)",
        "Salt and pepper to taste",
        "¼ cup raisins (optional, traditional in some versions)"
      ]
    },
    {
      id: 'chicken-afritada-1',
      title: 'Chicken Afritada',
      cover: chickenafritada,
      images: [chickenafritadaExtra, chickenafritadaExtra1],
      ingredientsImage: chickenafritadaIng,
      description: 'Chicken Afritada is a classic Filipino tomato-based stew cooked with chicken, potatoes, carrots, and bell peppers.',
      ingredients:[
        "1 whole chicken, cut into serving pieces",
        "2 medium potatoes, peeled and cubed",
        "1–2 carrots, sliced",
        "1 red bell pepper, sliced",
        "1 green bell pepper, sliced",
        "1 small onion, chopped",
        "4 cloves garlic, minced",
        "1 cup tomato sauce",
        "1 cup water or chicken broth",
        "2 tbsp soy sauce (optional)",
        "1 tbsp fish sauce / patis (optional)",
        "1 bay leaf (optional)",
        "½ cup green peas (optional)",
        "2–3 hotdogs or sausages, sliced (optional)",
        "2 tbsp liver spread (optional)",
        "2 tbsp cooking oil",
        "Salt and black pepper to taste"
      ]
    },
    {
      id: 'bicol-express-1',
      title: 'Bicol Express',
      cover: bicolexpress,
      images: [bicolexpressExtra, bicolexpressExtra1],
      ingredientsImage: bicolexpressIng,
      description: 'Bicol Express is a spicy Filipino dish made with pork, coconut milk, chili peppers, and shrimp paste.',
      ingredients: [
        "500g pork belly, sliced thin",
        "2 cups coconut milk",
        "1 cup coconut cream",
        "4 cloves garlic, minced",
        "1 medium onion, chopped",
        "2 tbsp shrimp paste (bagoong alamang)",
        "5-8 red chili peppers (siling labuyo or long chili)",
        "2 tbsp cooking oil",
        "1 tsp sugar (optional)",
        "Salt and pepper to taste"
      ]
    },
  ];


  return (
    <main className="main-content">
      {filteredRecipes.length === 0 && searchQuery && (
  <div className="no-results-container">

    <img
      src={no_recipe}
      alt="No recipes found"
      className="no-results-img"
    />

    <h2 className="no-results-title">
      We couldn’t find any recipes 
    </h2>

    <p className="no-results-text">
      We looked everywhere, but nothing matched <strong>“{searchQuery}”</strong>.
    </p>

    <p className="no-results-subtext">
      Try checking the spelling, or search something like
      <span> adobo, sinigang, or chicken </span>.
    </p>


  </div>
)}

      <div className="card-container">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className={`card ${expandedCard === recipe.id ? 'expanded' : ''} animate-card`}
          >
            <img src={recipe.cover} alt={recipe.title} className="card-image" />
            <button className="center-info-btn" onClick={() => handleRecipeModal(recipe)}></button>
            <button className="card-button view-btn" onClick={() => toggleExpand(recipe.id)}>
              {expandedCard === recipe.id ? 'Hide Recipe' : 'View Recipe'}
            </button>

            {isSaved(recipe.id) && <div className="added-notification">ADDED TO YOUR COOKBOOK</div>}

            {isSaved(recipe.id) ? (
              <div className="card-button add-btn">
                <img src={addedIcon} alt="Added" className="add-icon" style={{ opacity: 1 }} />
              </div>
            ) : (
              <button className="card-button add-btn" onClick={() => handleAdd(recipe)}>
                <img src={addIcon} alt="Add" className="add-icon" />
              </button>
            )}

            <div className={`expanded-content ${expandedCard === recipe.id ? 'visible' : ''}`}>
              <img
                src={recipe.ingredientsImage}
                alt="Ingredients"
                className="ingredients-image"
                onClick={() => handleIngredientModal(recipe.ingredientsImage)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Info Modal (carousel) */}
      {infoModal.recipe && (
        <div className="info-overlay" onClick={() => setInfoModal({ recipe: null, image: null })}>
          <div className="info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="info-close-btn" onClick={() => setInfoModal({ recipe: null, image: null })}>
              <img src={backBtnInfo} alt="Back" className="back-icon" />
            </button>

            <div className="carousel-container">
              <button className="carousel-btn prev" onClick={() => prevSlide(infoModal.recipe)}>‹</button>
              <img
                key={currentSlide}
                src={infoModal.recipe.images[currentSlide]}
                alt={`${infoModal.recipe.title} ${currentSlide + 1}`}
                className={`info-image ${slideDirection}`}
              />
              <button className="carousel-btn next" onClick={() => nextSlide(infoModal.recipe)}>›</button>
            </div>

            <div className="carousel-indicators">
              {infoModal.recipe.images.map((_, idx) => (
                <span key={idx} className={`dot ${currentSlide === idx ? 'active' : ''}`} />
              ))}
            </div>

            <div className="info-content">
              <h2>{infoModal.recipe.title}</h2>
              <p>{infoModal.recipe.description}</p>
              {infoModal.recipe.ingredients && infoModal.recipe.ingredients.length > 0 && (
                <>
                  <h3 className="ingredients-title">Ingredients</h3>
                  <ul className="ingredients-list">
                    {infoModal.recipe.ingredients.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ingredient Modal */}
      {infoModal.image && (
        <div className="ingredient-modal-overlay" onClick={() => setInfoModal({ recipe: null, image: null })}>
          <div className="ingredient-modal-box" onClick={(e) => e.stopPropagation()}>
            <img src={infoModal.image} alt="Ingredients" />
          </div>
        </div>
      )}

      {/* LOGIN MODAL OVERLAY */}
      {showLoginPrompt && (
        <div
          className="login-prompt-overlay"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="login-prompt-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Please log in</h3>
            <p>You need to be logged in to save recipes to your cookbook.</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                style={{ padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                onClick={() => setShowLoginPrompt(false)}
              >
                Close
              </button>
              <button
                style={{ padding: '10px 20px', background: '#1e8449', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                onClick={() => {
                  navigate('/login');
                  setShowLoginPrompt(false);
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
  
    </main>
  );
}