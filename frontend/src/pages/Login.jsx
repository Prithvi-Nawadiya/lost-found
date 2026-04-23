import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://lostfound-backend-3198.onrender.com/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="row justify-content-center auth-container">
      <div className="col-md-5">
        <div className="text-center mb-4">
          <h2 style={{fontWeight: 700, color: '#1a202c'}}>Welcome Back</h2>
          <p className="text-muted">Login to manage your lost & found items</p>
        </div>
        <Card className="p-2 border-0">
          <Card.Body>
            {error && <Alert variant="danger" className="border-0 rounded-3">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="form-label">Email Address</Form.Label>
                <Form.Control type="email" name="email" placeholder="name@example.com" required onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="form-label">Password</Form.Label>
                <Form.Control type="password" name="password" placeholder="••••••••" required onChange={handleChange} />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100 py-2 mt-2">
                Sign In
              </Button>
            </Form>
            <div className="text-center mt-4 text-muted">
              Don't have an account? <Link to="/register" className="text-decoration-none" style={{color: '#4361ee', fontWeight: 500}}>Register now</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Login;
