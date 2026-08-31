import AppRoutes from "@/routes/AppRoutes";
import { ToastContainer, toast } from 'react-toastify';

export default function App() {
  const notify = () => toast("Wow so easy!");

  notify();

  return (
    <div>
      <AppRoutes />
      <ToastContainer />


    </div>


  )
}