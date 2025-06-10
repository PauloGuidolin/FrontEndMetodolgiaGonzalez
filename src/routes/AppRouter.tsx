// Archivo: src/AppRouter.tsx (CON ESTE CAMBIO)

import { Navigate, Route, Routes } from "react-router";
import { HomeScreen } from "../components/screens/HomeScreen/HomeScreen";
import { HelpScreen } from "../components/screens/HelpScreen/HelpScreen";
import CartScreen from "../components/screens/CartScreen/CartScreen";
import { UserProfile  } from "../components/screens/UserProfile/UserProfile";
import ProductDetailPage from "../components/screens/ProductDetailPage/ProductDetailPage";
import OrderConfirmation from "../components/screens/MecadoPagoScreens/OrderConfirmation";
import AdminProductScreen from "../components/screens/Admin/AdminProductScreen/AdminProductScreen";
import { ProductReferencesScreen } from "../components/screens/Admin/ProductReferencesScreen/ProductReferencesScreen";
import AdminUsersScreen from "../components/screens/Admin/AdminUsersScreen/AdminUsersScreen";
import SalesPage from "../components/screens/Admin/SalesPage/SalesPage";
import ProductScreen from "../components/screens/ProductsScreen/ProductScreen";


export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/HomeScreen" />} />
        <Route path="/HomeScreen" element={<HomeScreen />} />
        <Route path="/HelpScreen" element={<HelpScreen />} />
        <Route path="/CartScreen" element={<CartScreen />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/productos" element={<ProductScreen />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        {/* ⭐ Rutas de Mercado Pago - No necesitan ":param" si los datos vienen por query params */}
        <Route path="/checkout/success" element={<OrderConfirmation />} />
        <Route path="/checkout/failure" element={<OrderConfirmation />} />
        <Route path="/checkout/pending" element={<OrderConfirmation />} />
        {/* Mantienes esta ruta para cuando quieras navegar directamente a una orden ya confirmada */}
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} /> 
        {/* Rutas de Admin */}
        <Route path="/admin/productos" element={<AdminProductScreen />} />
        <Route path="/admin/ProductReferencesScreen" element={<ProductReferencesScreen />} />
        <Route path="/admin/AdminUsersScreen" element={<AdminUsersScreen />} />
        <Route path="/admin/SalesPage" element={<SalesPage />} />
      </Routes>
    </>
  );
};