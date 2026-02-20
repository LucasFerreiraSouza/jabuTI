import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import AulasVisitantes from "./pages/AulasVisitantes/AulasVisitantes";
import AulasEstudantes from "./pages/AulasEstudantes/AulasEstudantes";
import AulasAdmin from "./pages/AulasAdmin/AulasAdmin";

import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* público */}
        <Route path="/" element={<AulasVisitantes />} />
        <Route path="/login" element={<Login />} />

        {/* estudante  */}
        <Route
          path="/aulas-estudantes"
          element={
            <ProtectedRoute allow={["ESTUDANTE"]}>
              <AulasEstudantes />
            </ProtectedRoute>
          }
        />

        {/* admin */}
        <Route
          path="/aulas-admin"
          element={
            <ProtectedRoute allow={["ADMIN"]}>
              <AulasAdmin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
