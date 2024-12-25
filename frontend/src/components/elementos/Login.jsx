import React, { useState } from "react";
import { login } from "@/utils/api.jsx"; // Asegúrate de que la ruta es correcta

const LoginForm = () => {
  const [email, setEmail] = useState(""); // Estado para email
  const [password, setPassword] = useState(""); // Estado para password
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const data = await login(email, password);
      console.log("Inicio de sesión exitoso:", data);
      // Redirigir al usuario o actualizar el estado de la aplicación
      window.location.href = "/"; // Por ejemplo, redirigir a la página principal
    } catch (err) {
      setError("Credenciales incorrectas o error en el servidor.");
    }
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2>Iniciar Sesión</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Asegúrate de que se use setEmail
            placeholder="Introduce tu email"
            style={{ width: "100%", marginBottom: "10px" }}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Asegúrate de que se use setPassword
            placeholder="Introduce tu contraseña"
            style={{ width: "100%", marginBottom: "20px" }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007BFF",
            color: "#FFF",
            border: "none",
            cursor: "pointer",
          }}
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
