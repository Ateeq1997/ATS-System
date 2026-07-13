import { Route, Routes } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Home } from "@/pages/Home";
import { Dashboard } from "@/pages/Dashboard";
import { History } from "@/pages/History";
import { HistoryDetail } from "@/pages/HistoryDetail";
import { Compare } from "@/pages/Compare";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<HistoryDetail />} />
        </Routes>
      </main>
    </div>
  );
}
