import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell";
import HomePage from "./pages/Home";
import { Provider } from "react-redux";
import { store } from "./app/redux/store";
import OrdersListPage from "./pages/OrdersListPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/api/tanstack";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import OrderCreatePage from "./pages/OrderCreatePage";
import OrderUpdatePage from "./pages/OrderUpdatePage";
function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/orders" element={<OrdersListPage />} />
              <Route path="/orders/create" element={<OrderCreatePage />} />
              <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
              <Route
                path="/orders/:orderId/update"
                element={<OrderUpdatePage />}
              />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
