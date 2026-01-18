import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Mouse tracking effect
        const handleMouseMove = (e) => {
            const orb = document.querySelector('.mouse-orb');
            if (orb) {
                orb.style.left = `${e.clientX}px`;
                orb.style.top = `${e.clientY}px`;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/register', {
                name,
                email,
                password,
                role
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="mouse-orb"></div>
            <div className="auth-container">
                <h2>Create Account</h2>
                {error && <p style={{ color: '#ff6b6b', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            className="auth-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Register as:</label>
                        <select
                            className="auth-input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="student">Student</option>
                            <option value="provider">Food Provider</option>
                        </select>
                    </div>
                    <button type="submit" className="auth-button">
                        Register
                    </button>
                </form>
                <p className="auth-link">
                    Already have an account? <Link to="/">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
