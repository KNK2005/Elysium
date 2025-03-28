import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Navbar from './components/NavBar/NavBar';
import PostDetailPage from './pages/PostDetailPage';
import About from './pages/About';
import ChatPage from './pages/ChatPage';

import './App.css'; 

function App() {
  return (
    <Router>
      {/* Navbar remains visible across all pages */}
      <Navbar />

      {/* Main content container for pages */}
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<ChatPage />} />

          <Route path="/signup" element={<SignupPage />} />
          <Route path="/posts/:postId" element={<PostDetailPage />} />
          <Route path="/about" element={<About />} />

        </Routes>
      </main>
    </Router>
  );
}

export default App;
