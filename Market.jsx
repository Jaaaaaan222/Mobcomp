import React, { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { Geolocation } from "@capacitor/geolocation";
import { useNavigate } from "react-router-dom";
import "./Market.css";

import marketIcon from "../assets/market.png";
import marketIconSelected from "../assets/market1.png";
import returnIcon from "../assets/return.png";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "16px",
};

const fallbackCenter = { lat: 14.5995, lng: 120.9842 };

const bannedWords = [
  "sari",
  "convenience",
  "mini",
  "store",
  "7-11",
  "7 eleven",
  "tindahan",
];

export default function Market() {
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [directions, setDirections] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loading, setLoading] = useState(true); // ✅ NEW

  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
    libraries: ["places"],
  });

  // 🌐 offline listener
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // 📍 get location
  useEffect(() => {
    async function getLocation() {
      try {
        const pos = await Geolocation.getCurrentPosition();
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      } catch (err) {
        console.log("Location error:", err);
        setUserLocation(fallbackCenter);
      }
    }
    getLocation();
  }, []);

  // 🛒 fetch places
  useEffect(() => {
    if (!isLoaded || !userLocation) return;

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    const collected = [];

    const handle = (res, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        collected.push(...res);

        const unique = Array.from(
          new Map(collected.map((p) => [p.place_id, p])).values()
        );

        const cleaned = unique.filter((p) => {
          const name = (p.name || "").toLowerCase();

          const isBanned = bannedWords.some((w) =>
            name.includes(w)
          );

          const isValidType =
            p.types?.includes("supermarket") ||
            p.types?.includes("grocery_or_supermarket");

          return isValidType && !isBanned;
        });

        setPlaces(cleaned);
        setFiltered(cleaned);
      }
    };

    service.nearbySearch(
      {
        location: new window.google.maps.LatLng(
          userLocation.lat,
          userLocation.lng
        ),
        radius: 5000,
        type: "supermarket",
      },
      handle
    );

    service.nearbySearch(
      {
        location: new window.google.maps.LatLng(
          userLocation.lat,
          userLocation.lng
        ),
        radius: 5000,
        keyword: "grocery supermarket food ingredients",
      },
      handle
    );
  }, [isLoaded, userLocation]);

  // 🔎 search
  useEffect(() => {
    if (!search) {
      setFiltered(places);
      setSuggestions([]);
      return;
    }

    const q = search.toLowerCase();

    const matched = places.filter((p) =>
      p.name.toLowerCase().includes(q)
    );

    setFiltered(matched);
    setSuggestions(matched.slice(0, 5));
  }, [search, places]);

  // 🧭 route
  const handleRoute = (place) => {
    if (!userLocation) return;

    setSelected(place);
    setShowSuggestions(false);

    const directionsService =
      new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: userLocation,
        destination: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") setDirections(result);
      }
    );
  };

  // ⏳ loading control
  useEffect(() => {
    if (isLoaded && userLocation) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, userLocation]);

  // ❌ offline screen
  if (isOffline) {
    return (
      <div className="offline-screen">
        <div className="offline-modal">
          <h2>No Internet Connection</h2>
          <p>Please connect to internet to view nearby markets.</p>
          <button onClick={() => navigate("/")}>OK</button>
        </div>
      </div>
    );
  }

  // 🧊 skeleton loader
  const SkeletonLoader = () => {
    return (
      <div className="skeleton-wrapper">
        <div className="skeleton-header"></div>
        <div className="skeleton-search"></div>
        <div className="skeleton-map"></div>

        <div className="skeleton-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <SkeletonLoader />;

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="market-page">

      {/* back */}
      <div className="back-button" onClick={() => navigate("/")}>
        <img src={returnIcon} alt="Back" />
      </div>

      {/* label */}
      <div className="app-label">
        {selected ? "Selected Market" : "Nearby Markets"}
      </div>

      {/* search */}
      <div className="market-search">
        <input
          type="text"
          placeholder="Search supermarkets e.g. Puregold, SM..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-box">
            {suggestions.map((s) => (
              <div
                key={s.place_id}
                className="suggestion-item"
                onClick={() => {
                  setSearch(s.name);
                  handleRoute(s);
                }}
              >
                <strong>{s.name}</strong>
                <span>{s.vicinity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || fallbackCenter}
        zoom={14}
        onLoad={(map) => (mapRef.current = map)}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            label={{ text: "You", color: "green" }}
          />
        )}

        {filtered.map((p) => {
          const isSelected =
            selected?.place_id === p.place_id;

          return (
            <Marker
              key={p.place_id}
              position={{
                lat: p.geometry.location.lat(),
                lng: p.geometry.location.lng(),
              }}
              onClick={() => handleRoute(p)}
              icon={{
                url: isSelected
                  ? marketIconSelected
                  : marketIcon,
                scaledSize: new window.google.maps.Size(45, 45),
              }}
            />
          );
        })}

        {directions && (
          <DirectionsRenderer directions={directions} />
        )}
      </GoogleMap>

      {/* info */}
      <div className="map-bottom-info">
        {selected ? (
          <>
            <h3>{selected.name}</h3>
            <p>{selected.vicinity}</p>
          </>
        ) : (
          <p>Select a supermarket or grocery store</p>
        )}
      </div>

      {/* list */}
      <div className="market-scroll">
        {filtered.map((p) => {
          const isSelected =
            selected?.place_id === p.place_id;

          return (
            <div
              key={p.place_id}
              className={`market-card ${
                isSelected ? "active" : ""
              }`}
              onClick={() => handleRoute(p)}
            >
              <h3>{p.name}</h3>
              <p>{p.vicinity}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}