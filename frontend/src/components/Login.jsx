import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';
import '../pages/Login.css';

const LoginForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result && result.success) {
      setFormData({ email: "", password: "" });
    } else {
      setError(result?.message || "Ошибка входа");
    }
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        <span>or use your account</span>
        {error && <div className="error-message">{error}</div>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
        />
        <a href="/" onClick={(e) => e.preventDefault()} className="forgot-password">Forgot your password?</a>
        <button className="form-button" type="submit">SIGN IN</button>
      </form>
    </div>
  );
};

const RegisterForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    if (formData.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    const result = await register(formData);
    if (result && result.success) {
      setFormData({ name: "", email: "", password: "" });
    } else {
      setError(result?.message || "Ошибка регистрации");
    }
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <br/>
        <span>or use your email for registration</span>
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
        />
        <button className="form-button" type="submit">SIGN UP</button>
      </form>
    </div>
  );
};

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="auth-page">
      <div className={`container ${isSignUp ? "right-panel-active" : ""}`}>
        <RegisterForm />
        <LoginForm />

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h2>Welcome back</h2>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" onClick={() => setIsSignUp(false)}>
                SIGN IN
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2>Hello there</h2>
              <p>Enter your personal details and start your journey with us</p>
              <button className="ghost" onClick={() => setIsSignUp(true)}>
                SIGN UP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};