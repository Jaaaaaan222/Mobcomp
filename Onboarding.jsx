import { useState } from "react";
import onboarding1 from "../assets/onboarding1.png";
import onboarding2 from "../assets/onboarding2.png";
import onboarding3 from "../assets/onboarding3.png";
import onboarding4 from "../assets/onboarding4.png";

const slides = [
  {
    title: "Welcome!",
    description:
      "Discover authentic Filipino recipes, cooking guides, and meal ideas in one app.",
    bg: onboarding1,
  },
  {
    title: "Step-by-step cooking guide",
    description:
      "Follow simple instructions for everyday meals like adobo, sinigang, and more.",
    bg: onboarding2,
  },
  {
    title: "Find ingredients near you",
    description:
      "Locate nearby markets and stores to get fresh and affordable ingredients.",
    bg: onboarding3,
  },
  {
    title: "Plan your meals easily",
    description:
      "Create weekly meal plans and auto-generate your shopping list.",
    bg: onboarding4,
  },
];

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const [clicked, setClicked] = useState(false);

  const next = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onFinish?.();
    }
  };

  const handleClick = () => {
    // 🔥 trigger animation
    setClicked(true);
    setTimeout(() => setClicked(false), 250);

    next();
  };

  const skip = () => onFinish?.();

  return (
    <div style={styles.wrapper}>
      {/* SLIDER */}
      <div
        style={{
          ...styles.slider,
          transform: `translateX(-${step * 100}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              ...styles.container,
              backgroundImage: `url(${slide.bg})`,
            }}
          >
            {/* TOP BAR */}
            <div style={styles.topBar}>
              <button style={styles.skip} onClick={skip}>
                Skip
              </button>
            </div>

            {/* CONTENT */}
            <div style={styles.bottomContent}>
              <div style={styles.textBlock}>
                <h1 style={styles.title}>{slide.title}</h1>
                <p style={styles.description}>{slide.description}</p>
              </div>

              {/* DOTS */}
              <div style={styles.dots}>
                {slides.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.dot,
                      background: i === step ? "#8aa22b" : "#ffffff",
                    }}
                  />
                ))}
              </div>

              {/* BUTTON (ANIMATED) */}
              <button
                className={`onboard-button ${clicked ? "clicked" : ""}`}
                onClick={handleClick}
              >
                {step === slides.length - 1 ? "Get Started" : "Next"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 ANIMATION STYLES */}
      <style>{`
        .onboard-button {
          width: 100%;
          padding: 14px;
          background-color: #D3F04F;
          color: black;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          cursor: pointer;

          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .onboard-button:active {
          transform: scale(0.96);
        }

        /* bounce effect */
        .onboard-button.clicked {
          animation: pop 0.25s ease;
        }

        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
  },

  slider: {
    display: "flex",
    width: "100%",
    height: "100%",
    transition: "transform 0.4s ease-in-out",
  },

  container: {
    minWidth: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    boxSizing: "border-box",

    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },

  topBar: {
    display: "flex",
    justifyContent: "flex-end",
  },

  skip: {
    background: "none",
    border: "none",
    color: "#0000008c",
    fontSize: "14px",
    cursor: "pointer",
  },

  bottomContent: {
    marginTop: "auto",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  textBlock: {
    textAlign: "center",
    padding: "0 10px",
  },

  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#000000",
  },

  description: {
    fontSize: "15px",
    color: "#000000",
    marginBottom: "30px",
  },

  dots: {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
  },

  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
};