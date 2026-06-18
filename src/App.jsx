import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Collections from './pages/Collections';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="collections" element={<Collections />} />
            <Route path="cart" element={<Cart />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </CartProvider>
    </Router>
  );
}
