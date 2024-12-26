import React, { useState, useEffect } from "react";
import "./global.css";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value); // Llama a la función onSearch con el nuevo término
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        className="lupita"
        placeholder="Buscar carpetas y notas..."
        value={searchTerm}
        onChange={handleChange}
      />
      <button className="lupita">
        <span>🔍</span>
      </button>
    </div>
  );
};

export default SearchBar;
