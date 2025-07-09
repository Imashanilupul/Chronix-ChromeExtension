import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";




export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
            
       
      </Routes>
    </HashRouter>
  );
}
