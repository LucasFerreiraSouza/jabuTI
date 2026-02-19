import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Aulas from "./pages/Aulas/Aulas";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Aulas />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
