import React, { useState, useEffect } from "react";
import api from "@/utils/api";
import "./FolderTree.css";
import SearchBar from "./filtros/Buscador";
import Filtro from "./filtros/Filtros";
import FolderNode from "./FolderNode";

const FolderTree = () => {
  const [folders, setFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [category, setCategory] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await api.get("/folders");
        setFolders(response.data);
        setFilteredFolders(response.data);
        localStorage.setItem("folders", JSON.stringify(response.data));

        const categorias = await api.get("/categorias");
        setCategory(categorias.data);
        localStorage.setItem("category", JSON.stringify(categorias.data));

        const tags = await api.get("/tags");
        setTags(tags.data);
        localStorage.setItem("tags", JSON.stringify(tags.data));
      } catch (error) {
        console.error("Error fetching folders:", error);
        const savedFolders = localStorage.getItem("folders");
        if (savedFolders) {
          const parsedFolders = JSON.parse(savedFolders);
          setFolders(parsedFolders);
          setFilteredFolders(parsedFolders);
        }
      }
    };
    fetchFolders();
  }, []);

  // Función para filtrar por categoría y tags
  const applyFilters = (selectedCategory, selectedTags) => {
    const filterFolder = (folder) => {
      // Filtrar notas según categoría y tags
      const filteredNotes = folder.notes?.filter((note) => {
        const categoryMatch =
          !selectedCategory ||
          (note.categoria && note.categoria.id === parseInt(selectedCategory));
        const tagsMatch =
          selectedTags.length === 0 ||
          selectedTags.every((tagId) =>
            note.tags.some((noteTag) => noteTag.id === parseInt(tagId)),
          );
        return categoryMatch && tagsMatch;
      });

      // Procesar subcarpetas recursivamente
      const filteredSubfolders = folder.subfolders
        ?.map(filterFolder)
        .filter(
          (sf) =>
            sf !== null &&
            (sf.notes?.length > 0 ||
              sf.subfolders?.some((subsf) => subsf !== null)),
        );

      // Si la carpeta tiene notas filtradas o subcarpetas con contenido, devolver la carpeta modificada
      if (
        (filteredNotes && filteredNotes.length > 0) ||
        (filteredSubfolders && filteredSubfolders.length > 0)
      ) {
        return {
          ...folder,
          notes: filteredNotes || [],
          subfolders: filteredSubfolders || [],
        };
      }
      return null;
    };

    const filtered = folders
      .map(filterFolder)
      .filter((folder) => folder !== null);

    setFilteredFolders(filtered);
  };

  // Función mejorada para búsqueda
  const searchInFolder = (folder, searchTerm) => {
    const term = searchTerm.toLowerCase();

    // Buscar en notas
    const matchingNotes = folder.notes?.filter(
      (note) =>
        note.titulo.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term),
    );

    // Buscar en subcarpetas recursivamente
    const subfolderResults = folder.subfolders
      ?.map((subfolder) => searchInFolder(subfolder, searchTerm))
      .filter((result) => result !== null);

    // Si hay notas que coinciden o subcarpetas con resultados, devolver una nueva estructura
    if (
      (matchingNotes && matchingNotes.length > 0) ||
      (subfolderResults && subfolderResults.length > 0)
    ) {
      return {
        ...folder,
        notes: matchingNotes || [],
        subfolders: subfolderResults || [],
      };
    }

    return null;
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredFolders(folders);
      return;
    }

    const results = folders
      .map((folder) => searchInFolder(folder, searchTerm))
      .filter((result) => result !== null);

    setFilteredFolders(results);
  };

  return (
    <div className="global">
      <div className="primero">
        <h1 className="titulo">Carpetas</h1>
        <div className="filtrar">
          <Filtro onApplyFilters={applyFilters} />
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      {filteredFolders.map((folder) => (
        <ul key={folder.id} className="folder-tree">
          <FolderNode folder={folder} />
        </ul>
      ))}
    </div>
  );
};

export default FolderTree;
