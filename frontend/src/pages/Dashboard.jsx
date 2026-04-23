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
      const res = await axios.get('https://expense-tracker-a8kj.onrender.com/api/items');
      setItems(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`https://expense-tracker-a8kj.onrender.com/api/items/search?name=${search.name}&category=${search.category}`);
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
        await axios.put(`https://expense-tracker-a8kj.onrender.com/api/items/${editItem._id}`, formData, config);
      } else {
        await axios.post('https://expense-tracker-a8kj.onrender.com/api/items', formData, config);
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
        await axios.delete(`https://expense-tracker-a8kj.onrender.com/api/items/${id}`, {
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
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{fontWeight: 700, color: '#1a202c'}}>Dashboard</h2>
        <Button variant="primary" onClick={() => {
          setEditItem(null);
          setFormData({ ItemName: '', Description: '', Type: 'Lost', Location: '', Date: '', ContactInfo: '' });
          setShowModal(true);
        }}>+ Report Item</Button>
      </div>

      <Card className="mb-4 p-2">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={5}>
                <Form.Control type="text" placeholder="Search items by name..." value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })} />
              </Col>
              <Col md={4}>
                <Form.Select value={search.category} onChange={(e) => setSearch({ ...search, category: e.target.value })}>
                  <option value="">All Categories</option>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button variant="outline-primary" type="submit" className="w-100">Search Filter</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <div className="table-wrapper">
        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Status</th>
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
                <td style={{fontWeight: 500}}>{item.ItemName}</td>
                <td><span className={`badge ${item.Type === 'Lost' ? 'badge-lost' : 'badge-found'}`}>{item.Type}</span></td>
                <td className="text-muted">{item.Description}</td>
                <td>{item.Location}</td>
                <td className="text-muted">{new Date(item.Date).toLocaleDateString()}</td>
                <td>{item.ReportedBy?.Name || 'Unknown'}</td>
                <td>
                  {item.ReportedBy?._id === user.id && (
                    <>
                      <Button variant="light" size="sm" className="me-2 text-primary" onClick={() => handleEdit(item)}>Edit</Button>
                      <Button variant="light" size="sm" className="text-danger" onClick={() => handleDelete(item._id)}>Delete</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-5 text-muted">No items found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{fontWeight: 700}}>{editItem ? 'Edit Item Details' : 'Report New Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} className="px-2 pb-2">
            <Form.Group className="mb-3">
              <Form.Label className="form-label">Item Name</Form.Label>
              <Form.Control type="text" name="ItemName" placeholder="e.g. Blue Backpack" value={formData.ItemName} required onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label">Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="Description" placeholder="Provide clear details..." value={formData.Description} required onChange={handleChange} />
            </Form.Group>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label">Status</Form.Label>
                  <Form.Select name="Type" value={formData.Type} onChange={handleChange}>
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="form-label">Date</Form.Label>
                  <Form.Control type="date" name="Date" value={formData.Date} required onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="form-label">Location</Form.Label>
              <Form.Control type="text" name="Location" placeholder="Where was it lost/found?" value={formData.Location} required onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="form-label">Contact Info</Form.Label>
              <Form.Control type="text" name="ContactInfo" placeholder="Phone number or email" value={formData.ContactInfo} required onChange={handleChange} />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 py-2">
              {editItem ? 'Save Changes' : 'Submit Item'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Dashboard;
