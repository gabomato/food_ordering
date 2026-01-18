import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import foodFacts from '../data/foodFacts.json';
import './Dashboard.css';

function Dashboard() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showOrders, setShowOrders] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderConfirmation, setOrderConfirmation] = useState(null);
    const [userName, setUserName] = useState('');
    const [currentFact, setCurrentFact] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // Get user data from localStorage
        const userDataStr = localStorage.getItem('user');
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                setUserName(userData.name || userData.email);
            } catch (err) {
                console.error('Error parsing user data:', err);
            }
        }

        // Get and rotate food fact
        let factIndex = parseInt(localStorage.getItem('foodFactIndex') || '0');
        setCurrentFact(foodFacts[factIndex]);
        // Increment for next login
        factIndex = (factIndex + 1) % foodFacts.length;
        localStorage.setItem('foodFactIndex', factIndex.toString());

        // Fetch products
        fetch('http://localhost:3000/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error('Error fetching products:', err));

        // Fetch user orders
        fetchOrders();
    }, [navigate]);

    const fetchOrders = () => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:3000/api/orders', {
            headers: {
                'Authorization': `Bearer ${oken}`
            }
        })
            .then(res => res.json())
            .then(data => {
                // Ensure data is an array
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    console.error('Orders data is not an array:', data);
                    setOrders([]);
                }
            })
            .catch(err => {
                console.error('Error fetching orders:', err);
                setOrders([]);
            });
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity === 0) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    const placeOrder = () => {
        if (cart.length === 0) {
            alert('Cart is empty!');
            return;
        }

        const token = localStorage.getItem('token');
        const orderData = {
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity
            })),
            totalPrice: getTotalPrice()
        };

        fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${oken}`
            },
            body: JSON.stringify(orderData)
        })
            .then(res => res.json())
            .then(data => {
                console.log('Order response:', data);
                console.log('Pickup code from server:', data.pickupCode);
                console.log('Order ID from server:', data.orderId);

                // Store order confirmation data
                const confirmationData = {
                    pickupCode: data.pickupCode,
                    orderId: data.orderId,
                    items: cart,
                    totalPrice: getTotalPrice(),
                    pickupDate: data.pickupDate
                };

                console.log('Confirmation data being set:', confirmationData);
                setOrderConfirmation(confirmationData);
                setShowOrderModal(true);
                setCart([]);
                fetchOrders();
            })
            .catch(err => {
                console.error('Error placing order:', err);
                alert('Failed to place order. Please try again.');
            });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>School Food Pre-Order</h1>
                <div className="header-right">
                    {userName && (
                        <div className="user-welcome">
                            <span className="welcome-text">Welcome, </span>
                            <span className="user-name">{userName}</span>
                        </div>
                    )}
                    <div className="header-buttons">
                        <button onClick={() => {
                            console.log('My Orders button clicked. Current showOrders:', showOrders);
                            setShowOrders(!showOrders);
                        }}>
                            {showOrders ? 'Show Menu' : 'My Orders'}
                        </button>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </header>

            {!showOrders ? (
                <div className="main-content">
                    <div className="products-section">
                        <h2>Available Food Items</h2>
                        <div className="products-grid">
                            {products.map(product => (
                                <div key={product.id} className="product-card">
                                    <img src={product.image} alt={product.name} />
                                    <h3>{product.name}</h3>
                                    <p className="provider">Provider: {product.provider}</p>
                                    <p className="description">{product.description}</p>
                                    <p className=\"price\">�${roduct.price.toFixed(2)}</p>
                                    <button onClick={() => addToCart(product)}>Add to Cart</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="cart-section">
                        <h2>Shopping Cart</h2>
                        {cart.length === 0 ? (
                            <p>Cart is empty</p>
                        ) : (
                            <>
                                <div className="cart-items">
                                    {cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <img src={item.image} alt={item.name} className="cart-item-image" />
                                            <div className="cart-item-info">
                                                <h4>{item.name}</h4>
                                                <p className=\"cart-item-price\">${tem.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                            <div className="cart-item-controls">
                                                {item.quantity === 1 ? (
                                                    <button onClick={() => removeFromCart(item.id)} className="trash-btn" title="Remove from cart">🗑</button>
                                                ) : (
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                                                )}
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="cart-total">
                                    <h3>Total: ${etTotalPrice()}</h3>
                                    <button onClick={placeOrder} className="place-order-btn">Place Order</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="orders-section">
                    <h2>My Orders</h2>
                    {orders.length === 0 ? (
                        <p className="no-orders">No orders yet</p>
                    ) : (
                        <>
                            {/* Ongoing Orders */}
                            <div className="orders-category">
                                <h3>Ongoing Orders</h3>
                                <div className="orders-list">
                                    {orders.filter(order => order.status === 'ordered' || order.status === 'ready').length === 0 ? (
                                        <p className="no-orders-text">No ongoing orders</p>
                                    ) : (
                                        orders
                                            .filter(order => order.status === 'ordered' || order.status === 'ready')
                                            .map(order => (
                                                <div key={order.id} className="order-card">
                                                    <div className="order-header">
                                                        <h4>Order #{order.id}</h4>
                                                        <span className={`status ${rder.status}`}>{order.status}</span>
                                                    </div>
                                                    <div className="pickup-code-highlight">
                                                        <strong>Pickup Code:</strong>
                                                        <span className="code">{order.pickupCode}</span>
                                                    </div>
                                                    <div className="order-details">
                                                        <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                                                        <p><strong>Pickup Date:</strong> {new Date(order.pickupDate).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="order-items-summary-card">
                                                        <h4>Order Summary</h4>
                                                        {order.items && order.items.length > 0 ? (
                                                            <div className="items-list">
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx} className="item-row">
                                                                        <div className="item-details">
                                                                            <span className="item-name">{item.name}</span>
                                                                            <span className="item-provider">by {item.provider}</span>
                                                                        </div>
                                                                        <span className="item-qty">× {item.quantity}</span>
                                                                        <span className="item-price\">${(item.price * item.quantity).toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                                <div className="order-total-row">
                                                                    <span>Total:</span>
                                                                    <span className="total-amount\">${rder.totalPrice}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="no-items">No items found</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>

                            {/* Past Orders */}
                            <div className="orders-category">
                                <h3>Past Orders</h3>
                                <div className="orders-list">
                                    {orders.filter(order => order.status === 'collected').length === 0 ? (
                                        <p className="no-orders-text">No past orders</p>
                                    ) : (
                                        orders
                                            .filter(order => order.status === 'collected')
                                            .map(order => (
                                                <div key={order.id} className="order-card past">
                                                    <div className="order-header">
                                                        <h4>Order #{order.id}</h4>
                                                        <span className={`status ${rder.status}`}>{order.status}</span>
                                                    </div>
                                                    <div className="order-details">
                                                        <p><strong>Pickup Code:</strong> {order.pickupCode}</p>
                                                        <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                                                        <p><strong>Pickup Date:</strong> {new Date(order.pickupDate).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="order-items-summary-card">
                                                        <h4>Order Summary</h4>
                                                        {order.items && order.items.length > 0 ? (
                                                            <div className="items-list">
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx} className="item-row">
                                                                        <div className="item-details">
                                                                            <span className="item-name">{item.name}</span>
                                                                            <span className="item-provider">by {item.provider}</span>
                                                                        </div>
                                                                        <span className="item-qty">× {item.quantity}</span>
                                                                        <span className="item-price\">${(item.price * item.quantity).toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                                <div className="order-total-row">
                                                                    <span>Total:</span>
                                                                    <span className="total-amount\">${rder.totalPrice}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="no-items">No items found</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Order Confirmation Modal */}
            {showOrderModal && orderConfirmation && (
                <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>✓ Order Placed Successfully!</h2>
                            <button className="modal-close" onClick={() => setShowOrderModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="pickup-code-section">
                                <p className="pickup-label">Your Pickup Code:</p>
                                <div className="pickup-code-display">
                                    {orderConfirmation.pickupCode || 'ERROR: Code not generated'}
                                </div>
                                {!orderConfirmation.pickupCode && (
                                    <p className="pickup-error">Please check console for debugging info</p>
                                )}
                                <p className="pickup-note">Save this code to pick up your order</p>
                            </div>

                            <div className="order-summary">
                                <h3>Order Summary</h3>
                                <div className="summary-row">
                                    <span>Order ID:</span>
                                    <span>#{orderConfirmation.orderId}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Pickup Date:</span>
                                    <span>{new Date(orderConfirmation.pickupDate).toLocaleDateString()}</span>
                                </div>
                                <div className="order-items-summary">
                                    <strong>Items:</strong>
                                    <ul>
                                        {orderConfirmation.items.map((item, idx) => (
                                            <li key={idx}>
                                                {item.name} × {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="summary-row total">
                                    <span>Total:</span>
                                    <span>${rderConfirmation.totalPrice}</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="modal-btn" onClick={() => setShowOrderModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;

