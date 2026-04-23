import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Card, Table, Modal, Row, Col } from 'react-bootstrap';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    ItemName: '', Description: '', Type: 'Lost', Location: '', Date: '', ContactInfo: ''
  });
  const [search, setSearch] = useState({ name: '', category: '' });

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/items');
      setItems(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:5000/api/items/search?name=${search.name}&category=${search.category}`);
      setItems(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editItem) {
        await axios.put(`http://localhost:5000/api/items/${editItem._id}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/items', formData, config);
      }
      setShowModal(false);
      setEditItem(null);
      setFormData({ ItemName: '', Description: '', Type: 'Lost', Location: '', Date: '', ContactInfo: '' });
      fetchItems();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchItems();
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || 'Error deleting item');
      }
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      ItemName: item.ItemName,
      Description: item.Description,
      Type: item.Type,
      Location: item.Location,
      Date: new Date(item.Date).toISOString().split('T')[0],
      ContactInfo: item.ContactInfo
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <Button variant="primary" onClick={() => {
          setEditItem(null);
          setFormData({ ItemName: '', Description: '', Type: 'Lost', Location: '', Date: '', ContactInfo: '' });
          setShowModal(true);
        }}>Report Item</Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={5}>
                <Form.Control type="text" placeholder="Search by name" value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })} />
              </Col>
              <Col md={4}>
                <Form.Select value={search.category} onChange={(e) => setSearch({ ...search, category: e.target.value })}>
                  <option value="">All Categories</option>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button variant="secondary" type="submit" className="w-100">Search</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Location</th>
            <th>Date</th>
            <th>Reported By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id}>
              <td>{item.ItemName}</td>
              <td><span className={`badge ${item.Type === 'Lost' ? 'bg-danger' : 'bg-success'}`}>{item.Type}</span></td>
              <td>{item.Description}</td>
              <td>{item.Location}</td>
              <td>{new Date(item.Date).toLocaleDateString()}</td>
              <td>{item.ReportedBy?.Name || 'Unknown'}</td>
              <td>
                {item.ReportedBy?._id === user.id && (
                  <>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(item)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item._id)}>Delete</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? 'Edit Item' : 'Report Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Item Name</Form.Label>
              <Form.Control type="text" name="ItemName" value={formData.ItemName} required onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" name="Description" value={formData.Description} required onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select name="Type" value={formData.Type} onChange={handleChange}>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control type="text" name="Location" value={formData.Location} required onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" name="Date" value={formData.Date} required onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Info</Form.Label>
              <Form.Control type="text" name="ContactInfo" value={formData.ContactInfo} required onChange={handleChange} />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              {editItem ? 'Update' : 'Submit'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Dashboard;
