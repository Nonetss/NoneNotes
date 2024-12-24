### **1. Categorías**

**Endpoint Base:** `/api/categorias/`

- **GET `/api/categorias/`**:  
  Devuelve una lista de todas las categorías.

- **POST `/api/categorias/`**:  
  Crea una nueva categoría.

- **GET `/api/categorias/{id}/`**:  
  Devuelve los detalles de una categoría específica.

- **PUT `/api/categorias/{id}/`**:  
  Actualiza completamente una categoría específica.

- **PATCH `/api/categorias/{id}/`**:  
  Actualiza parcialmente una categoría específica.

- **DELETE `/api/categorias/{id}/`**:  
  Elimina una categoría específica.

---

### **2. Tags**

**Endpoint Base:** `/api/tags/`

- **GET `/api/tags/`**:  
  Devuelve una lista de todos los tags.

- **POST `/api/tags/`**:  
  Crea un nuevo tag.

- **GET `/api/tags/{id}/`**:  
  Devuelve los detalles de un tag específico.

- **PUT `/api/tags/{id}/`**:  
  Actualiza completamente un tag específico.

- **PATCH `/api/tags/{id}/`**:  
  Actualiza parcialmente un tag específico.

- **DELETE `/api/tags/{id}/`**:  
  Elimina un tag específico.

---

### **3. Folders**

**Endpoint Base:** `/api/folders/`

- **GET `/api/folders/`**:  
  Devuelve una lista de todas las carpetas principales (parent=None) del usuario autenticado.

- **POST `/api/folders/`**:  
  Crea una nueva carpeta. Puede asignarse una carpeta padre (`parent`) para crear subcarpetas.

- **GET `/api/folders/{id}/`**:  
  Devuelve los detalles de una carpeta específica, incluyendo sus subcarpetas.

- **PUT `/api/folders/{id}/`**:  
  Actualiza completamente una carpeta específica.

- **PATCH `/api/folders/{id}/`**:  
  Actualiza parcialmente una carpeta específica.

- **DELETE `/api/folders/{id}/`**:  
  Elimina una carpeta específica y todas sus subcarpetas asociadas.

---

### **4. Notas**

**Endpoint Base:** `/api/notas/`

- **GET `/api/notas/`**:  
  Devuelve una lista de todas las notas del usuario autenticado.

- **POST `/api/notas/`**:  
  Crea una nueva nota asociada al usuario autenticado. Puedes especificar `folder`, `tags`, y `categoria`.

- **GET `/api/notas/{id}/`**:  
  Devuelve los detalles de una nota específica, incluyendo la categoría, tags y carpeta asociada.

- **PUT `/api/notas/{id}/`**:  
  Actualiza completamente una nota específica.

- **PATCH `/api/notas/{id}/`**:  
  Actualiza parcialmente una nota específica.

- **DELETE `/api/notas/{id}/`**:  
  Elimina una nota específica y su archivo Markdown asociado.

- **PUT `/api/notas/{id}/content/`**:  
  Actualiza el contenido del archivo Markdown asociado a una nota específica.

---

### **Resumen de Métodos Disponibles:**

| **Entidad**         | **GET**                   | **POST** | **PUT**                                  | **PATCH**                               | **DELETE**                     |
| ------------------- | ------------------------- | -------- | ---------------------------------------- | --------------------------------------- | ------------------------------ |
| **Categorías**      | Lista y detalle           | Crear    | Actualizar completo                      | Actualizar parcial                      | Eliminar                       |
| **Tags**            | Lista y detalle           | Crear    | Actualizar completo                      | Actualizar parcial                      | Eliminar                       |
| **Folders**         | Lista principal y detalle | Crear    | Actualizar completo                      | Actualizar parcial                      | Eliminar                       |
| **Notas**           | Lista y detalle           | Crear    | Actualizar completo (contenido incluido) | Actualizar parcial (contenido incluido) | Eliminar (incluye archivo .md) |
| **Contenido Notas** | N/A                       | N/A      | Actualizar contenido Markdown            | N/A                                     | N/A                            |
