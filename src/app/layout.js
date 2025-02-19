import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


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
        /AuthProvider> < /
        body > <
        /html>
    );
}