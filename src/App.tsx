import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<div className="p-8"><h1 className="text-3xl font-bold">Zoned</h1><p>Scientific Running Workouts</p></div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
