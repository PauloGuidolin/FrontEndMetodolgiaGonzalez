import { Navigate, Route, Routes } from "react-router"
import { HomeScreen } from "../components/screens/HomeScreen/HomeScreen"

export const AppRouter = () => {

  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/HomeScreen" />} />
      <Route path="/HomeScreen" element={<HomeScreen />}/>
    </Routes>
    </>
  )
}
