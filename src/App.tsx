import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Patients from "@/pages/Patients"; // ✅ Import sem chaves

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/patients" element={<Patients />} />
        {/* outras rotas */}
      </Routes>
    </Router>
  );
}

export default App;
