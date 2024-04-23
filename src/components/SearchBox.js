import React, { useState } from "react";

//import composant Ant Design et React Icons
import { FaStar } from "react-icons/fa";
import { MdMyLocation } from "react-icons/md";
import { IoSearch } from "react-icons/io5";

//import des composants
import SuggestionBox from "./SuggestionBox.js";

export const SearchBox = ({ onWeatherInput, setLoadingCity }) => {

  const apiWeather = process.env.REACT_APP_WEATHER_API_KEY;


  const [city, setCity] = useState("");

  // Suggestions de villes
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFavoris, setShowFavoris] = useState(false);

  async function handleInputChange(value) {
    setCity(value);
    if (value.length >= 3) {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/search.json?key=${apiWeather}&q=${value}`
          );
        //si pas de reponse
        if (!response.ok) {
            throw new Error("Ville non trouvée");
        }
          
       const data = await response.json();
       //si aucune ville non trouvee
        if (!data.length) {
            throw new Error("Ville non trouvée");
        }
        const suggestions = data.map((item) => `${item.name}, ${item.country}`);
        setSuggestions(suggestions || []);
        setError("");
        setShowSuggestions(true);
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  //soumission du formulaire ou la props reprends le nom de la city pour la véhiculer sur App
  const handleFormSubmit = (e) => {
      e.preventDefault();
      // recherche la meteo si au mons une ville a ete suggere,sinon c est que n imp' a ete saisie
      if (error || !showSuggestions) {
        setError("Location not found");
        //efface le message de erreur
        setTimeout(setError, 3000, "");
    } else {
      setError("");
      // Appel de la fonction de gestion de la ville dans l'app component
      onWeatherInput(city);
      // Effacer l'input après la soumission
      setCity("");
      setShowSuggestions(false);
    }
  };

  function handleSuggestionClick(value) {
    setCity(value);
    setShowSuggestions(false);
    setShowFavoris(false);
  }

  /* geolocalisation */
  const handleGeolocation = (e) => {
    setLoadingCity(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
          onWeatherInput(`${latitude},${longitude}`);
      }, (error) => {
          //in case of user denied hide loading skeleton
          setLoadingCity(false);
      });
      }
  };

  return (
    <div className="setCity">
      <div>
        <MdMyLocation
          title="Votre position actuelle" // légende affichée lors du hover
          onClick={handleGeolocation}
          className="iconLarger"
        />
      </div>
      <div>
        <FaStar
          title="Vos favoris" // légende affichée lors du hover
          onClick={() => {setShowFavoris(!showFavoris);}}
          className="iconLarger"
        />
      </div>
      <form>
        <input
          placeholder="Tapez votre recherche ici..."
          value={city}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <SuggestionBox
          {...{ showSuggestions, showFavoris, suggestions, handleSuggestionClick, error }}
        />
        <button type="submit" onClick={(e) => handleFormSubmit(e)}>
          <IoSearch className="iconSearch" />
        </button>
      </form>
    </div>
  );
};

export default SearchBox;
