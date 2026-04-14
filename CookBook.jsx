import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import '../CookBook.css';
import removeIcon from '../assets/remove.png';
import noteIcon from '../assets/note.png';
import pinIcon from '../assets/pin.png';
import calendarIcon from '../assets/calendar.png';
import addIcon from '../assets/add.png';
import viewNoteIcon from '../assets/viewnotes.png';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import 'react-calendar/dist/Calendar.css';

// Import images (unchanged)
import porksinigangIng from '../assets/sinigang-ing.png';
import porkadoboIng from '../assets/porkadobo-ing.png';
import porkmenudoIng from '../assets/porkmenudo-ing.png';
import chickenadoboIng from '../assets/chickenadobo-ing.png';
import shrimpsinigangIng from '../assets/shrimpsinigang-ing.png';

import porksinigang from '../assets/porksinigang.png';
import porkadobo from '../assets/porkadobo.png';
import porkmenudo from '../assets/porkmenudo.png';
import chickenadobo from '../assets/chickenadobo.png';
import shrimpsinigang from '../assets/shrimpsinigang.png';

export default function CookBook() {
  const [recipes, setRecipes] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, recipeId: null });

  const [notesModal, setNotesModal] = useState(false);
  const [activeRecipeId, setActiveRecipeId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarActiveStartDate, setCalendarActiveStartDate] = useState(new Date());
  const [calendarAssignments, setCalendarAssignments] = useState({});
  const [calendarModal, setCalendarModal] = useState({ isOpen: false, date: null, visible: false });

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [removeAllModal, setRemoveAllModal] = useState(false);
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginModal, setLoginModal] = useState(false);

  // New state to track which recipes have notes
  const [recipesWithNotes, setRecipesWithNotes] = useState({});

  const sampleRecipes = [
    { id: 'pork-sinigang-1', title: 'Pork Sinigang', cover: porksinigang, ingredientsImage: porksinigangIng },
    { id: 'shrimp-sinigang-1', title: 'Shrimp Sinigang', cover: shrimpsinigang, ingredientsImage: shrimpsinigangIng },
    { id: 'pork-adobo-1', title: 'Pork Adobo', cover: porkadobo, ingredientsImage: porkadoboIng },
    { id: 'chicken-adobo-1', title: 'Chicken Adobo', cover: chickenadobo, ingredientsImage: chickenadoboIng },
    { id: 'pork-menudo-1', title: 'Pork Menudo', cover: porkmenudo, ingredientsImage: porkmenudoIng },
  ];

  // Load notes from localStorage on mount and when recipes change
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('recipeNotes') || '{}');
    const hasNotes = {};
    
    recipes.forEach(recipe => {
      if (savedNotes[recipe.id] && savedNotes[recipe.id].trim() !== '') {
        hasNotes[recipe.id] = true;
      }
    });
    
    setRecipesWithNotes(hasNotes);
  }, [recipes]);

  // ==================== REMOVE ALL FUNCTIONS ====================

  const openRemoveAllModal = () => {
    if (!isLoggedIn) {
      setLoginModal(true);
      return;
    }
    if (recipes.length === 0) return;
    setRemoveAllModal(true);
  };

  const confirmRemoveAll = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, 'users', user.uid);
      const recipesRef = doc(userDocRef, 'cookbook', 'recipes');

      // Clear UI immediately (optimistic update)
      setRecipes([]);

      // Clear Firestore
      await setDoc(recipesRef, {
        items: [],
        updatedAt: new Date(),
      }, { merge: true });

      window.dispatchEvent(new Event('cookbookUpdated'));
    } catch (err) {
      console.error("Remove all failed:", err);
    }

    setRemoveAllModal(false);
  };

  const cancelRemoveAll = () => {
    setRemoveAllModal(false);
  };

  // ==================== EXISTING CODE (UNCHANGED) ====================

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Load data
  useEffect(() => {
    if (isLoggedIn) {
      const user = auth.currentUser;
      if (!user) return;

      const loadData = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);

          const cookbookSnap = await getDoc(doc(userDocRef, 'cookbook', 'recipes'));
          if (cookbookSnap.exists()) {
            setRecipes(cookbookSnap.data().items || []);
          } else {
            setRecipes([]);
          }

          const calendarSnap = await getDoc(doc(userDocRef, 'cookbook', 'calendar'));
          if (calendarSnap.exists()) {
            setCalendarAssignments(calendarSnap.data().assignments || {});
          } else {
            setCalendarAssignments({});
          }
        } catch (err) {
          console.error("Load error:", err);
        }
      };

      loadData();
    } else {
      setRecipes([]);
      setCalendarAssignments({});
    }
  }, [isLoggedIn]);

  // Save calendar assignments when they change
  useEffect(() => {
    if (!isLoggedIn || Object.keys(calendarAssignments).length === 0) return;

    const user = auth.currentUser;
    if (!user) return;

    const saveCalendar = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const calendarRef = doc(userDocRef, 'cookbook', 'calendar');

        const snap = await getDoc(calendarRef);

        if (!snap.exists()) {
          await setDoc(calendarRef, {
            assignments: calendarAssignments,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          await setDoc(calendarRef, {
            assignments: calendarAssignments,
            updatedAt: new Date(),
          }, { merge: true });
        }
      } catch (err) {
        console.error("Save calendar failed:", err);
      }
    };

    saveCalendar();
  }, [calendarAssignments, isLoggedIn]);

  // Listen for updates from Home
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleUpdate = () => {
      const user = auth.currentUser;
      if (!user) return;

      const reload = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(doc(userDocRef, 'cookbook', 'recipes'));
          if (snap.exists()) {
            setRecipes(snap.data().items || []);
          }
        } catch (err) {
          console.error("Reload failed:", err);
        }
      };

      reload();
    };

    window.addEventListener('cookbookUpdated', handleUpdate);
    return () => window.removeEventListener('cookbookUpdated', handleUpdate);
  }, [isLoggedIn]);

  const requireLogin = (callback) => {
    if (!isLoggedIn) {
      setLoginModal(true);
      return;
    }
    callback();
  };

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  const handleRemoveClick = (id) => setModal({ isOpen: true, recipeId: id });

  const confirmRemove = () => {
    const id = modal.recipeId;
    setModal({ isOpen: false, recipeId: null });

    if (expandedId === id) setExpandedId(null);

    setRemovingId(id);

    setTimeout(() => {
      setRecipes(prev => prev.filter(r => r.id !== id));

      const saveRemoval = async () => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          const userDocRef = doc(db, 'users', user.uid);
          const recipesRef = doc(userDocRef, 'cookbook', 'recipes');

          await setDoc(recipesRef, {
            items: recipes.filter(r => r.id !== id),
            updatedAt: new Date(),
          }, { merge: true });

          window.dispatchEvent(new Event('cookbookUpdated'));
        } catch (err) {
          console.error("Remove save failed:", err);
        }
      };

      saveRemoval();
      setRemovingId(null);
    }, 600);
  };

  const cancelRemove = () => setModal({ isOpen: false, recipeId: null });

  const openNotes = (recipeId) => {
    setActiveRecipeId(recipeId);
    const savedNotes = JSON.parse(localStorage.getItem('recipeNotes') || '{}');
    setNoteText(savedNotes[recipeId] || '');
    setNotesModal(true);
  };

  const saveNotes = () => {
    const savedNotes = JSON.parse(localStorage.getItem('recipeNotes') || '{}');
    savedNotes[activeRecipeId] = noteText;
    localStorage.setItem('recipeNotes', JSON.stringify(savedNotes));
    
    // Refresh notes status after saving
    const hasNotes = { ...recipesWithNotes };
    hasNotes[activeRecipeId] = noteText.trim() !== '';
    setRecipesWithNotes(hasNotes);

    setNotesModal(false);
    setActiveRecipeId(null);
    setNoteText('');
  };

  const closeNotes = () => {
    setNotesModal(false);
    setActiveRecipeId(null);
  };

  const handleCalendarClick = (date) => {
    setCalendarModal({ isOpen: true, date, visible: true });
    setSearchText('');
    setSearchResults([]);
  };

  const handleSearchChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
    if (!text) {
      setSearchResults([]);
      return;
    }
    const filtered = sampleRecipes.filter(r =>
      r.title.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const addRecipeToDate = (recipe) => {
    const dateKey = calendarModal.date.toDateString();
    const existing = calendarAssignments[dateKey] || [];
    if (existing.some(r => r.id === recipe.id)) return;

    setCalendarAssignments(prev => ({
      ...prev,
      [dateKey]: [...existing, recipe]
    }));
    setSearchText('');
    setSearchResults([]);
  };

  const removeRecipeFromDate = (recipeId) => {
    const dateKey = calendarModal.date.toDateString();
    setCalendarAssignments(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter(r => r.id !== recipeId)
    }));
  };

  const renderCalendarTile = ({ date }) => {
    const dateKey = date.toDateString();
    if (calendarAssignments[dateKey]?.length) {
      return (
        <img
          src={pinIcon}
          alt="Scheduled"
          className="calendar-pin-icon"
          style={{ width: '16px', height: '16px', position: 'absolute', top: '4px', right: '4px' }}
        />
      );
    }
    return null;
  };

  const navigateSchedule = (direction) => {
    const scheduledDates = Object.keys(calendarAssignments)
      .filter(d => (calendarAssignments[d] || []).length > 0)
      .sort((a, b) => new Date(a) - new Date(b));

    let newDate = new Date(calendarDate);

    switch (direction) {
      case 'prev':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'next':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'prevScheduled':
        const prev = scheduledDates.filter(d => new Date(d) < calendarDate);
        if (prev.length) newDate = new Date(prev[prev.length - 1]);
        break;
      case 'nextScheduled':
        const next = scheduledDates.filter(d => new Date(d) > calendarDate);
        if (next.length) newDate = new Date(next[0]);
        break;
      default:
        break;
    }

    if (newDate.getMonth() !== calendarDate.getMonth() || newDate.getFullYear() !== calendarDate.getFullYear()) {
      setCalendarActiveStartDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }

    setCalendarDate(newDate);
  };

  return (
    <main className="main-content">
      <h1>My CookBook 📖</h1>

      {/* Personal Cookbook Section */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="personal-section-title">Personal CookBook</h2>
          {isLoggedIn && recipes.length > 0 && (
            <button 
              className="remove-all-btn"
              onClick={openRemoveAllModal}
              title="Remove all recipes from your cookbook"
            >
              Remove All Recipes
            </button>
          )}
        </div>

        {recipes.length === 0 ? (
          <div className="empty-cookbook">
            <h3 className="empty-text">EMPTY</h3>
            <p>
              CLICK THE <img src={addIcon} alt="Add" className="inline-icon" /> BUTTON TO ADD RECIPES
            </p>
          </div>
        ) : (
          <div className="horizontal-scroll">
            {recipes.map(recipe => {
              const isExpanded = expandedId === recipe.id;
              const isRemoving = removingId === recipe.id;
              const hasNote = !!recipesWithNotes[recipe.id];

              return (
                <div className={`card ${isExpanded ? 'expanded' : ''} ${isRemoving ? 'removing' : ''}`} key={recipe.id}>
                 <button
  className={`notes-btn ${hasNote ? 'has-notes' : ''}`}
  onClick={() => requireLogin(() => openNotes(recipe.id))}
>
  <img
    src={hasNote ? viewNoteIcon : noteIcon}
    alt="Notes"
    className="notes-icon"
  />
  <span className="notes-text">
    {hasNote ? 'VIEW NOTES' : 'ADD NOTES'}
  </span>
</button>
                  <img src={recipe.cover} alt={recipe.title} className="card-image" />
                  <button className="card-button view-btn" onClick={() => toggleExpand(recipe.id)}>
                    {isExpanded ? 'Hide Recipe' : 'View Recipe'}
                  </button>
                  {isLoggedIn && (
                    <button className="card-button remove-btn" onClick={() => requireLogin(() => handleRemoveClick(recipe.id))}>
                      <img src={removeIcon} alt="Remove" className="remove-icon" />
                    </button>
                  )}
                  <div className={`expanded-content ${isExpanded ? 'visible' : ''}`}>
                    {isExpanded && recipe.ingredientsImage && (
                      <img src={recipe.ingredientsImage} alt={`${recipe.title} Ingredients`} className="ingredients-image" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Calendar Section - unchanged */}
      <section className="section-container">
        <h2 className="cookbook-section-title">Meal Planner</h2>

        <div className="calendar-wrapper">
          <Calendar
            onClickDay={(date) => requireLogin(() => handleCalendarClick(date))}
            value={calendarDate}
            onChange={(date) => {
              setCalendarDate(date);
              if (date.getMonth() !== calendarActiveStartDate.getMonth() || date.getFullYear() !== calendarActiveStartDate.getFullYear()) {
                setCalendarActiveStartDate(new Date(date.getFullYear(), date.getMonth(), 1));
              }
            }}
            activeStartDate={calendarActiveStartDate}
            onActiveStartDateChange={({ activeStartDate }) => setCalendarActiveStartDate(activeStartDate)}
            tileContent={renderCalendarTile}
          />
        </div>

        <div className="calendar-schedule-preview">
          <div className="calendar-header">
            <button className="calendar-nav-btn" onClick={() => navigateSchedule('prevScheduled')}>«</button>
            <button className="calendar-nav-btn" onClick={() => navigateSchedule('prev')}>‹</button>
            <h3>
              <img src={calendarIcon} alt="calendar icon" className="calendar-icon" />
              {calendarDate.toDateString()}
            </h3>
            <button className="calendar-nav-btn" onClick={() => navigateSchedule('next')}>›</button>
            <button className="calendar-nav-btn" onClick={() => navigateSchedule('nextScheduled')}>»</button>
          </div>

          {(calendarAssignments[calendarDate.toDateString()] || []).length === 0 ? (
            <p className="no-schedule">You have no meals planned for this day</p>
          ) : (
            <ul className="preview-list">
              {(calendarAssignments[calendarDate.toDateString()] || []).map(r => (
                <li key={r.id} className="preview-item">
                  <img src={pinIcon} alt="Pin" className="preview-pin-icon" />
                  {r.title}
                </li>
              ))}
            </ul>
          )}

          {isLoggedIn && (
            <div className="calendar-manage-container">
              <button
                className="calendar-edit-btn"
                onClick={() => requireLogin(() =>
                  setCalendarModal({ isOpen: true, date: calendarDate, visible: true })
                )}
              >
                Plan Meals
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Cooking Guides Section - unchanged */}
      <section className="section-container">
        <h2 className="cookbook-section-title">Cooking Guides</h2>
        <div className="guide-list">
          <div className="guide-card">Guide 1: How to cook Pork Sinigang</div>
          <div className="guide-card">Guide 2: Best Cooking Tips</div>
          <div className="guide-card">Guide 3: Ingredient Substitutes</div>
        </div>
      </section>

      {/* REMOVE SINGLE RECIPE MODAL - unchanged */}
      {modal.isOpen && (
        <div className="remove-modal-overlay">
          <div className="remove-modal-content">
            <p>Are you sure you want to remove this recipe? (notes will not be deleted)</p>
            <div className="modal-buttons">
              <button className="modal-btn confirm-btn" onClick={confirmRemove}>Yes</button>
              <button className="modal-btn cancel-btn" onClick={cancelRemove}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* NOTES MODAL - unchanged */}
      {notesModal && (
        <div className="notes-modal-overlay">
          <div className="notes-modal-content">
            <h3>Recipe Notes</h3>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Write your notes here..."
              className="notes-textarea"
            />
            <div className="modal-buttons">
              <button className="modal-btn confirm-btn" onClick={saveNotes}>Save</button>
              <button className="modal-btn cancel-btn" onClick={closeNotes}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR MODAL - unchanged */}
      {calendarModal.isOpen && (
        <div className={`calendar-modal-overlay ${calendarModal.visible ? 'visible' : ''}`}>
          <div className="calendar-modal-content">
            <h3>Planned Meal for {calendarModal.date.toDateString()}</h3>

            <ul className="calendar-modal-existing">
              {(calendarAssignments[calendarModal.date.toDateString()] || []).map(r => (
                <li key={r.id}>
                  {r.title}
                  <button className="remove-assignment-btn" onClick={() => removeRecipeFromDate(r.id)}>✕</button>
                </li>
              ))}
            </ul>

            <h4>What dish would you like to find?:</h4>
            <input
              type="text"
              placeholder="Discover meals you’ll love"
              value={searchText}
              onChange={handleSearchChange}
              className="calendar-search-input"
            />

            {searchResults.length > 0 && (
              <ul className="calendar-search-results">
                {searchResults.map(r => {
                  const dateKey = calendarModal.date.toDateString();
                  const alreadyAdded = (calendarAssignments[dateKey] || []).some(a => a.id === r.id);

                  return (
                    <li
                      key={r.id}
                      onClick={() => !alreadyAdded && addRecipeToDate(r)}
                      className={alreadyAdded ? 'added' : ''}
                    >
                      {r.title} {alreadyAdded ? '(added)' : ''}
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              className="modal-btn cancel-btn"
              onClick={() => setCalendarModal({ isOpen: false, date: null, visible: false })}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* REMOVE ALL CONFIRMATION MODAL */}
      {removeAllModal && (
        <div className="remove-modal-overlay">
          <div className="remove-modal-content">
            <h3>Clear Entire Cookbook?</h3>
            <p>This action will remove <strong>all recipes</strong> from your Personal CookBook.<br />
            This cannot be undone. Notes will remain saved.</p>
            <div className="modal-buttons">
              <button className="modal-btn confirm-btn danger-btn" onClick={confirmRemoveAll}>
                Yes
              </button>
              <button className="modal-btn cancel-btn" onClick={cancelRemoveAll}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL - unchanged */}
      {loginModal && (
        <div className="login-modal-overlay" onClick={() => setLoginModal(false)}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Please log in</h3>
            <p>You must be logged in to save recipes, add notes, or manage your meal planner.</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel-btn" onClick={() => setLoginModal(false)}>Close</button>
              <button className="modal-btn confirm-btn" onClick={() => { navigate('/login'); setLoginModal(false); }}>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}