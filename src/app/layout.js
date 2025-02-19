import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Make sure the Toastify CSS is imported globally

export default function RootLayout({ children }) {
    return ( <
        html lang = "en" >
        <
        body >
        <
        AuthProvider >
        <
        Navbar / > { children } <
        Footer / >
        <
        ToastContainer / >
        <
        /AuthProvider> <
        /body> <
        /html>
    );
}