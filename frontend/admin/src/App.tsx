import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell";
import HomePage from "./pages/Home";
import { Provider } from "react-redux";
import { store } from "./app/redux/store";
import OrdersListPage from "./pages/OrdersListPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/api/tanstack";

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/orders" element={<OrdersListPage />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
