import {Routes, Route} from "react-router-dom";
import { DailyTrackerForm } from "../DailyTracker/DailyTrackerForm";

function App() {
  const Home = () => <h1>Home Page</h1>;  

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tracker/daily/form" element={<DailyTrackerForm />} />
    </Routes>
  )
}

   

export default App
