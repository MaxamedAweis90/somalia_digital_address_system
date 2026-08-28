import { useState } from "react";
import { signIn, signUp } from "../lib/auth-client";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      // 1. SIGN IN (Better Auth Engine)
      await signIn.email(
        { email, password },
        {
          onError: (ctx) => setError(ctx.error.message),
          onSuccess: () => {
            window.location.href = "/dashboard";
          },
        }
      );
    } else {
      // 2. SIGN UP (Better Auth Engine)
      await signUp.email(
        { email, password, name },
        {
          onError: (ctx) => setError(ctx.error.message),
          onSuccess: () => {
            window.location.href = "/dashboard";
          },
        }
      );
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>{isLogin ? "Soo Gal (Login)" : "Is-diwaan-gali (Sign Up)"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div>
            <label>Magaca Buuxa:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: "10px" }}>
        {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
      </button>
    </div>
  );
}