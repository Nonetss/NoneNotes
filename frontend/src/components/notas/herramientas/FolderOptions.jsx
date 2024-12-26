import React from "react";

const FolderOptions = ({ folders, depth = 0, renderedIds = new Set() }) => {
  const renderFolderOptions = (folders, depth, renderedIds) => {
    const options = [];

    folders.forEach((folder) => {
      if (!renderedIds.has(folder.id)) {
        // Marcamos la carpeta como renderizada
        renderedIds.add(folder.id);

        // Agregamos la opción actual con líneas o flechas
        options.push(
          <option key={folder.id} value={folder.id}>
            {Array(depth).fill(" │ ").join("")} ↳ {folder.nombre}
          </option>,
        );

        // Llamamos recursivamente para las subcarpetas
        if (folder.subfolders && folder.subfolders.length > 0) {
          options.push(
            ...renderFolderOptions(folder.subfolders, depth + 1, renderedIds),
          );
        }
      }
    });

    return options;
  };

  return <>{renderFolderOptions(folders, depth, renderedIds)}</>;
};

export default FolderOptions;
