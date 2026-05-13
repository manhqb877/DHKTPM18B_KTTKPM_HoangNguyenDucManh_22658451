import { useState, useEffect } from 'react';
import './App.css';

const API_PU1 = import.meta.env.VITE_PU1_URL;
const API_PU2 = import.meta.env.VITE_PU2_URL;
const API_PU3 = import.meta.env.VITE_PU3_URL;
const USER_ID = "HauTran_IUH"; // Tên user chóp bu để demo

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [detailProduct, setDetailProduct] = useState(null); // State quản lý Modal chi tiết

  const fetchData = async () => {
    try {
      // Gọi PU1 lấy SP + Số lượng tồn kho real-time
      const pRes = await fetch(`${API_PU1}/products`);
      setProducts(await pRes.json());
      
      // Gọi PU2 lấy Giỏ hàng
      const cRes = await fetch(`${API_PU2}/cart/${USER_ID}`);
      setCart(await cRes.json());
    } catch (error) {
      console.log("Đang kết nối Data Grid...");
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh tồn kho mỗi 1 giây để thầy thấy kho giảm real-time mượt mà
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // CHỨC NĂNG: Xem chi tiết
  const viewDetail = async (id) => {
    try {
      const res = await fetch(`${API_PU1}/products/${id}`);
      setDetailProduct(await res.json());
    } catch (error) {
      alert("Lỗi tải chi tiết sản phẩm!");
    }
  };

  // CHỨC NĂNG: Thêm vào giỏ
  const addToCart = async (productId) => {
    await fetch(`${API_PU2}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID, productId })
    });
    fetchData(); // Load lại giỏ
  };

  // CHỨC NĂNG: Đặt hàng
  const checkout = async () => {
    if (Object.keys(cart).length === 0) return alert("Giỏ hàng đang trống!");
    
    const res = await fetch(`${API_PU3}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID })
    });
    const data = await res.json();
    alert(data.message);
    fetchData(); // Load lại để thấy tồn kho đã bị giật
    setDetailProduct(null); // Đóng modal nếu đang mở
  };

  return (
    <div className="app-container">
      {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
      <div className="main-content">
        <h1 className="title-glow">⚡ 11.11 FLASH SALE - SPACE-BASED ⚡</h1>
        

        <div className="grid">
          {products.map(p => (
            <div key={p.id} className="card glass">
              <div className="card-img">{p.image}</div>
              <h3>{p.name}</h3>
              <h4 className="price">{p.price.toLocaleString()}đ</h4>
              <p className={p.stock > 0 ? "stock-ok" : "stock-out"}>
                {p.stock > 0 ? `Còn lại: ${p.stock} sản phẩm` : 'ĐÃ CHÁY HÀNG'}
              </p>
              
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={() => viewDetail(p.id)}>
                  Xem chi tiết
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => addToCart(p.id)}
                  disabled={p.stock <= 0}
                >
                  {p.stock > 0 ? 'Thêm vào giỏ' : 'HẾT HÀNG'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CỘT PHẢI: GIỎ HÀNG */}
      <div className="sidebar">
        <div className="cart-panel glass">
          <h2>🛒 Giỏ hàng </h2>
          <div className="cart-items">
            {Object.keys(cart).length === 0 ? <p className="empty-cart">Giỏ hàng trống trơn...</p> : (
              <ul>
                {Object.entries(cart).map(([id, qty]) => {
                  const p = products.find(x => x.id === id);
                  return (
                    <li key={id} className="cart-item">
                      <span>{p ? p.name : id}</span>
                      <span className="qty">x{qty}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <button className="btn btn-checkout" onClick={checkout} disabled={Object.keys(cart).length === 0}>
            🔥 CHỐT ĐƠN NGAY (SBA)
          </button>
        </div>
      </div>

      {/* MODAL CHI TIẾT SẢN PHẨM */}
      {detailProduct && (
        <div className="modal-overlay" onClick={() => setDetailProduct(null)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-img">{detailProduct.image}</div>
            <h2>{detailProduct.name}</h2>
            <p className="modal-desc">
              Siêu phẩm giảm giá cực sốc. Xử lý trực tiếp trên Data Grid không độ trễ.
              Nhanh tay đưa vào giỏ hàng trước khi bị cướp mất!
            </p>
            <h3 className="price">{detailProduct.price?.toLocaleString()} VNĐ</h3>
            <p className={detailProduct.stock > 0 ? "stock-ok" : "stock-out"}>
               Tồn kho Real-time: {detailProduct.stock} cái
            </p>
            
            <div className="modal-actions">
              <button 
                className="btn btn-primary" 
                onClick={() => { addToCart(detailProduct.id); setDetailProduct(null); }}
                disabled={detailProduct.stock <= 0}
              >
                {detailProduct.stock > 0 ? 'Bỏ vào giỏ ngay' : 'Đã hết hàng'}
              </button>
              <button className="btn btn-close" onClick={() => setDetailProduct(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;