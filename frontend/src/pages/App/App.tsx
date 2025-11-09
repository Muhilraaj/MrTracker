import {Routes, Route, Navigate} from "react-router-dom";
import { DailyTrackerForm } from "../DailyTracker/DailyTrackerForm";
import SignIn from "../SignIn/SignIn";
import SnackbarWrapper from "../../components/SnackBarWrapper";

function App() { 

  return (
    <>
      <Routes>
        <Route path="/" element={ <Navigate to="/login" replace={true} />  } />
        <Route path="/login" element={<SignIn />} />
        <Route path="/tracker/daily/form" element={<DailyTrackerForm />} />
      </Routes>
      <SnackbarWrapper />
    </>
  )
}

   

export default App
