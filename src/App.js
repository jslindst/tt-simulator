import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Simulator from "./pages/Simulator.tsx";
import ResourceTracker from "./pages/ResourceTracker.tsx";
import NoPage from "./pages/NoPage";
import MapView from "./components/MapView.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Simulator />} />
          <Route path="/resourceTracker" element={<ResourceTracker />} />
          <Route path="/mapView" element={<MapView />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}