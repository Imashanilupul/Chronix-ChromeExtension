import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Graphs from "./pages/Graphs";
import Popup from "./pages/popup";
import Settings from "./pages/Settings";



export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Popup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/graphs" element={<Graphs />} />
        <Route path="/settings" element={<Settings />} />


      </Routes>
    </HashRouter>
  );
}