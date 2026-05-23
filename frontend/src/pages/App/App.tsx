import {Routes, Route, Navigate} from "react-router-dom";
import { DailyTrackerForm } from "../DailyTracker/DailyTrackerForm";
import { MonthlyTrackerView } from "../MonthlyTracker/MonthlyTrackerView";
import SignIn from "../SignIn/SignIn";
import SnackbarWrapper from "../../components/SnackBarWrapper";

function App() { 

  return (
    <>
      <Routes>
        <Route path="/" element={ <Navigate to="/page/login" replace={true} />  } />
        <Route path="/page/login" element={<SignIn />} />
        <Route path="/page/tracker/daily/form" element={<DailyTrackerForm />} />
        <Route path="/page/tracker/monthly/view" element={<MonthlyTrackerView />} />
      </Routes>
      <SnackbarWrapper />
    </>
  )
}

   

export default App
