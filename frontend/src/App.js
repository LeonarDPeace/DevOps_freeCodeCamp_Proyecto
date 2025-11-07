import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from './config';

function App() {
  // Estado para almacenar usuarios obtenidos del backend
  const [users, setUsers] = useState([]);
  // Estado para el campo de entrada para agregar un nuevo usuario
  const [name, setName] = useState('');

  // Obtener usuarios cuando el componente se monta
  useEffect(() => {
    axios.get(API_ENDPOINTS.USERS).then(res => setUsers(res.data));
  }, []);

  // Agregar un nuevo usuario mediante la API
  const addUser = async () => {
    if (!name.trim()) return; // Evitar nombres vacíos
    
    const res = await axios.post(API_ENDPOINTS.USERS, { name });
    setUsers([...users, res.data]);
    setName('');
  };

  return (
    <div>
      <h1>Users</h1>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={addUser}>Add User</button>
      <ul>{users.map(user => <li key={user.id}>{user.name}</li>)}</ul>
    </div>
  );
}

export default App;
