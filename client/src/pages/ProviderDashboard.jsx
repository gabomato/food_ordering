import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProviderDashboard.css';

function ProviderDashboard() {
    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');

    // UI State
    const [message, setMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [products, setProducts] = useState([]);

    // Edit State
    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState('');

    const navigate = useNavigate();

    // Initial Load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            navigate('/');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'provider') {
                navigate('/dashboard');
                return;
            }
            setUserName(user.name);
            fetchMyProducts(token);
        } catch (e) {
            navigate('/');
        }
    }, [navigate]);

    const fetchMyProducts = async (token) => {
        try {
            const res = await fetch('http://localhost:3000/api/my-products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setProducts(data);
            }
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description,
                    price: parseFloat(price),
                    image
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Product added successfully!');
                setName('');
                setDescription('');
                setPrice('');
                setImage('');
                fetchMyProducts(token); // Refresh list
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(data.error || 'Failed to add product');
            }
        } catch (err) {
            setMessage('Network error');
        }
    };

    const handleDelete = async (id) => {
        console.log('Delete clicked for product ID:', id);
        if (!confirm('Are you sure you want to delete this item?')) return;
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`http://localhost:3000/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('Delete response status:', res.status);
            const data = await res.json();
            console.log('Delete response:', data);

            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
                alert('Product deleted successfully!');
            } else {
                alert('Failed to delete product: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Network error: ' + err.message);
        }
    };

    const startEditing = (product) => {
        console.log('Start editing product:', product);
        setEditingId(product.id);
        setEditPrice(product.price);
    };

    const savePrice = async (id) => {
        console.log('Saving price for product ID:', id, 'New price:', editPrice);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:3000/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ price: parseFloat(editPrice) })
            });

            console.log('Update response status:', res.status);
            const data = await res.json();
            console.log('Update response:', data);

            if (res.ok) {
                setProducts(products.map(p => p.id === id ? { ...p, price: parseFloat(editPrice) } : p));
                setEditingId(null);
                alert('Price updated successfully!');
            } else {
                alert('Failed to update price: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Update error:', err);
            alert('Network error: ' + err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="provider-dashboard-wrapper">
            <header className="provider-header">
                <div className="header-left">
                    <h1>Provider Portal</h1>
                    <span className="provider-badge">VENDOR MODE</span>
                </div>
                <div className="header-right">
                    {userName && (
                        <div className="user-welcome">
                            <span className="welcome-text">Welcome, </span>
                            <span className="user-name">{userName}</span>
                        </div>
                    )}
                    <div className="header-buttons">
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </div>
            </header>

            <div className="provider-content">
                {/* LEFT COLUMN: FORM */}
                <div className="add-product-card">
                    <h2>Add New Item</h2>
                    <p className="subtitle">Add to your menu</p>

                    {message && (
                        <div className={`message-banner ${message.includes('success') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="provider-form">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Spicy Chicken Works"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="List ingredients..."
                                required
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Price (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="url"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <button type="submit" className="submit-btn">
                            Publish Item
                        </button>
                    </form>
                </div>

                {/* RIGHT COLUMN: LIST */}
                <div className="my-menu-section">
                    <h2>My Menu ({products.length})</h2>
                    <div className="menu-grid">
                        {products.map(product => (
                            <div key={product.id} className="menu-card">
                                <img src={product.image} alt={product.name} />
                                <div className="menu-card-details">
                                    <h3>{product.name}</h3>
                                    <p className="desc">{product.description}</p>
                                </div>
                                <div className="price-row">
                                    {editingId === product.id ? (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input
                                                type="number"
                                                className="edit-price-input"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value)}
                                                step="0.01"
                                            />
                                            <button onClick={() => savePrice(product.id)} className="action-btn save-btn">✓</button>
                                            <button onClick={() => setEditingId(null)} className="action-btn delete-btn">✕</button>
                                        </div>
                                    ) : (
                                        <span className="price-tag">€{product.price.toFixed(2)}</span>
                                    )}

                                    <div className="menu-actions">
                                        {editingId !== product.id && (
                                            <>
                                                <button onClick={() => startEditing(product)} className="action-btn edit-btn">
                                                    Edit Price
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="action-btn delete-btn">
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProviderDashboard;
