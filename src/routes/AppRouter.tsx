import { Navigate, Route, Routes } from "react-router"
import { HomeScreen } from "../components/screens/HomeScreen/HomeScreen"
import { HelpScreen } from "../components/screens/HelpScreen/HelpScreen"
import CartScreen from "../components/screens/CartScreen/CartScreen"

export const AppRouter = () => {

  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/HomeScreen" />} />
      <Route path="/HomeScreen" element={<HomeScreen />}/>
      <Route path="/HelpScreen" element={<HelpScreen />}/>
      <Route path="/CartScreen" element={<CartScreen />}/>
    </Routes>
    </>
  )
}
