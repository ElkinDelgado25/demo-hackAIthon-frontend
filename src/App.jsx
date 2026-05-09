import { Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Homepage } from "./pages/HomePage";

function App() {
  return (
    <main className="app-shell">
      <Navbar />

      <section className="workspace">
        <Routes>
          <Route path="/" element={<Homepage />} />
        </Routes>
      </section>
    </main>
  );
}

export default App;
