import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../../utils/config';
const GROUPS = ["Group_1", "Group_2", "Group_3", "Group_4"];

const defaultQuestion = {
  text: '',
  options: { A: '', B: '', C: '', D: '' },
  correctOption: 'A',
  explanation: '',
  category: '',
  subcategory: '',
  sharedWith: { Group_1: false, Group_2: false, Group_3: false, Group_4: false }
};

export default function SharedQuestionsAdmin() {
  // Filtering state
  const [filter, setFilter] = useState({ group: '', category: '', subcategory: '' });
  const [questions, setQuestions] = useState([]);
  const [editing, setEditing] = useState(null); // question id or null
  const [form, setForm] = useState(defaultQuestion);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all shared questions
  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${config.API_URL}/api/admin/shared-questions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminKey')}` }
      });
      let list = res.data.questions || [];
      // Filter client-side for now
      if (filter.group) list = list.filter(q => q.sharedWith?.[filter.group]);
      if (filter.category) list = list.filter(q => q.category === filter.category);
      if (filter.subcategory) list = list.filter(q => q.subcategory === filter.subcategory);
      setQuestions(list);
    } catch (err) {
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q) => {
    setEditing(q.id);
    setForm({ ...q });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    setLoading(true);
    try {
      await axios.delete(`${config.API_URL}/api/admin/shared-questions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminKey')}` }
      });
      fetchQuestions();
    } catch {
      setError('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editing) {
        await axios.put(`${config.API_URL}/api/admin/shared-questions/${editing}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminKey')}` }
        });
      } else {
        await axios.post(`${config.API_URL}/api/admin/shared-questions`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminKey')}` }
        });
      }
      setEditing(null);
      setForm(defaultQuestion);
      fetchQuestions();
    } catch {
      setError('Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMapGroups = async (id, sharedWith) => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${config.API_URL}/api/admin/shared-questions/${id}/map`, { sharedWith }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminKey')}` }
      });
      fetchQuestions();
    } catch {
      setError('Mapping failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <h2>Shared MCQ Questions Admin</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {/* Filter Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <select value={filter.group} onChange={e => setFilter(f => ({ ...f, group: e.target.value }))}>
          <option value=''>All Groups</option>
          {GROUPS.map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
        </select>
        <input placeholder="Category filter" value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} style={{ width: 140 }} />
        <input placeholder="Subcategory filter" value={filter.subcategory} onChange={e => setFilter(f => ({ ...f, subcategory: e.target.value }))} style={{ width: 140 }} />
        <button onClick={() => setFilter({ group: '', category: '', subcategory: '' })}>Clear</button>
      </div>

      <form onSubmit={handleSave} style={{ background: '#f9f9fa', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <h4>{editing ? 'Edit' : 'Add'} Question</h4>
        <input required placeholder="Question text" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          {['A', 'B', 'C', 'D'].map(opt => (
            <input key={opt} required placeholder={`Option ${opt}`} value={form.options[opt]} onChange={e => setForm({ ...form, options: { ...form.options, [opt]: e.target.value } })} style={{ flex: 1 }} />
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          Correct Option:
          <select value={form.correctOption} onChange={e => setForm({ ...form, correctOption: e.target.value })}>
            {['A', 'B', 'C', 'D'].map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>
        <input required placeholder="Explanation" value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} style={{ width: '100%', marginTop: 8 }} />
        <input required placeholder="Category (e.g. Science)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', marginTop: 8 }} />
        <input required placeholder="Subcategory (e.g. Physics)" value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} style={{ width: '100%', marginTop: 8 }} />
        <div style={{ marginTop: 8 }}>
          <label>Map to Groups:</label>
          {GROUPS.map(g => (
            <label key={g} style={{ marginLeft: 12 }}>
              <input type="checkbox" checked={form.sharedWith[g]} onChange={e => setForm({ ...form, sharedWith: { ...form.sharedWith, [g]: e.target.checked } })} /> {g.replace('_', ' ')}
            </label>
          ))}
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>{editing ? 'Update' : 'Add'} Question</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm(defaultQuestion); }} style={{ marginLeft: 8 }}>Cancel</button>}
      </form>

      <h4>All Shared Questions</h4>
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', background: 'white', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Text</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Groups</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q.id}>
                <td>{q.text}</td>
                <td>{q.category}</td>
                <td>{q.subcategory}</td>
                <td>{GROUPS.filter(g => q.sharedWith?.[g]).map(g => g.replace('_', ' ')).join(', ')}</td>
                <td>
                  <button onClick={() => handleEdit(q)}>Edit</button>
                  <button onClick={() => handleDelete(q.id)} style={{ marginLeft: 4 }}>Delete</button>
                  <button onClick={() => {
                    // Toggle mapping UI
                    const newMap = { ...q.sharedWith };
                    GROUPS.forEach(g => { newMap[g] = !newMap[g]; });
                    handleMapGroups(q.id, newMap);
                  }} style={{ marginLeft: 4 }}>Toggle Map</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
