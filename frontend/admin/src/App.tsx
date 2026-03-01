import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell";
import HomePage from "./pages/Home";
import { Provider } from "react-redux";
import { store } from "./app/store";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
