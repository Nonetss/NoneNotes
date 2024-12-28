// FolderTree.jsx
import React, { useState, useEffect } from "react";
import api from "@/utils/api";
import "./FolderTree.css";
import SearchBar from "./filtros/Buscador";
import Filtro from "./filtros/Filtros";
import FolderNode from "./FolderNode";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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

  const moveFolder = async (folderId, targetFolderId) => {
    try {
      // Encuentra la carpeta a mover
      const folderToMove = folders.find((folder) => folder.id === folderId);
      if (!folderToMove) {
        console.error(`Carpeta con ID ${folderId} no encontrada.`);
        return;
      }

      // Verificar que no se mueva a sí misma o a una de sus subcarpetas

      const isDescendant = (folders, id, targetId) => {
        if (id === targetId) {
          // Si intentas mover una carpeta dentro de sí misma, devolvemos true
          console.error("No puedes mover una carpeta dentro de sí misma.");
          return true;
        }

        const findFolderById = (folders, folderId) => {
          for (const folder of folders) {
            if (folder.id === folderId) return folder;
            if (folder.subfolders?.length > 0) {
              const result = findFolderById(folder.subfolders, folderId);
              if (result) return result;
            }
          }
          return null;
        };

        const checkDescendant = (folder, targetId) => {
          if (!folder) return false;
          if (folder.subfolders?.some((sub) => sub.id === targetId))
            return true;
          return folder.subfolders?.some((sub) =>
            checkDescendant(sub, targetId),
          );
        };

        const folder = findFolderById(folders, id);
        return checkDescendant(folder, targetId);
      };

      if (isDescendant(folders, folderId, targetFolderId)) {
        console.error("No puedes mover una carpeta a una de sus subcarpetas.");
        return;
      }

      // Actualizar en el backend
      await api.patch(`/folders/${folderId}/`, { parent: targetFolderId });

      // Actualizar localmente
      const updateHierarchy = (folders, folderId, targetFolderId) => {
        let folderToMove = null;

        const updatedFolders = folders.map((folder) => {
          // Si es la carpeta que queremos mover, extraerla
          if (folder.id === folderId) {
            folderToMove = { ...folder };
            return null; // Eliminarla de su posición actual
          }

          // Recursivamente actualizar subcarpetas
          if (folder.subfolders) {
            const result = updateHierarchy(
              folder.subfolders,
              folderId,
              targetFolderId,
            );
            folder.subfolders = result.updatedFolders;
            folderToMove = folderToMove || result.folderToMove;
          }
          return folder;
        });

        // Si encontramos la carpeta, agregarla al nuevo parent
        if (folderToMove) {
          updatedFolders.forEach((folder) => {
            if (folder.id === targetFolderId) {
              folder.subfolders = [...(folder.subfolders || []), folderToMove];
            }
          });
        }

        return { updatedFolders: updatedFolders.filter(Boolean), folderToMove };
      };

      const { updatedFolders } = updateHierarchy(
        folders,
        folderId,
        targetFolderId,
      );
      setFolders(updatedFolders);

      console.log(`Carpeta ${folderId} movida a ${targetFolderId}`);
    } catch (error) {
      console.error(
        "Error al mover la carpeta:",
        error.response?.data || error,
      );
    }
  };

  const moveNote = (noteId, targetFolderId) => {
    console.log(`Mover nota ${noteId} a ${targetFolderId}`);
    // Implementa la lógica para mover una nota a otra carpeta
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
      <DndProvider backend={HTML5Backend}>
        {filteredFolders
          .filter((folder) => folder.parent === null)
          .map((folder) => (
            <ul className="folder-tree">
              <FolderNode
                key={folder.id}
                folder={folder}
                moveFolder={moveFolder}
                moveNote={moveNote}
              />
            </ul>
          ))}
      </DndProvider>
    </div>
  );
};

export default FolderTree;
