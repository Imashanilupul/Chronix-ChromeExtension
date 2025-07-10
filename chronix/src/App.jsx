import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Graphs from "./pages/graphs";
import Popup from "./pages/popup";



export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Popup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/graphs" element={<Graphs />} />
            
       
      </Routes>
    </HashRouter>
  );
}