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
import DocumentCreatePage from "./pages/DocumentCreatePage";
import DocumentUpdatePage from "./pages/DocumentUpdatePage";
import ProtectedRoute from "./components/ProtectedRoute";
import DocumentsListPage from "./pages/DocumentsListPage";
import TicketsListPage from "./pages/TicketsListPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import TicketUpdatePage from "./pages/TicketUpdatePage";
import ChatPage from "./pages/ChatPage";

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
              <Route path="/tickets" element={<TicketsListPage />} />
              <Route path="/tickets/:ticketId" element={<TicketDetailsPage />} />
              <Route
                path="/tickets/:ticketId/update"
                element={<TicketUpdatePage />}
              />
              <Route path="/chat/:ticketId" element={<ChatPage />} />
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/documents" element={<DocumentsListPage />} />
                <Route path="/documents/create" element={<DocumentCreatePage />} />
                <Route path="/documents/:filename/update" element={<DocumentUpdatePage />} />
              </Route>
            </Routes>
          </AppShell>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
