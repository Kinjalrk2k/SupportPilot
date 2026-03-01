import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell";
import HomePage from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
