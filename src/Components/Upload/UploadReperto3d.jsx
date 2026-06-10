import React, { useState } from 'react';

const UploadReperto3D = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    codice_reperto: '', // ✅ AGGIUNTO: Per collegarlo al Reperto SIPOR
  });
  
  const [files, setFiles] = useState({
    obj_file: null,
    mtl_file: null,
    textures: []
  });
  const [status, setStatus] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (name === 'textures') {
      setFiles({ ...files, textures: Array.from(selectedFiles) });
    } else {
      setFiles({ ...files, [name]: selectedFiles[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Caricamento in corso...');

    const data = new FormData();
    // Dati testuali
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('codice_reperto', formData.codice_reperto); // ✅ AGGIUNTO: Inviato al backend

    // File 3D
    if (files.obj_file) data.append('obj_file', files.obj_file);
    if (files.mtl_file) data.append('mtl_file', files.mtl_file);

    // Texture Multiple
    files.textures.forEach((file) => {
      data.append('textures', file);
    });

    try {
      const response = await fetch('http://localhost:8000/api/modelli/upload-completo/', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        setStatus(`✅ ${result.message || 'Caricamento completato!'}`);
      } else {
        const errorData = await response.json();
        setStatus(`❌ Errore: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      setStatus(`⚠️ Errore di rete: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ marginTop: 0 }}>Carica Reperto 3D</h2>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>Associa i file 3D a un codice reperto esistente nel database.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* ✅ CAMPO CRUCIALE: Il codice che fa da ponte tra Modello e Reperto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 'bold' }}>Codice Reperto (SIPOR):</label>
            <input 
              name="codice_reperto" 
              placeholder="es: 0900654321" 
              onChange={handleInputChange} 
              required 
              style={{ padding: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 'bold' }}>Nome Visualizzato:</label>
            <input 
              name="name" 
              placeholder="Nome del Modello 3D" 
              onChange={handleInputChange} 
              required 
              style={{ padding: '8px' }}
            />
          </div>

          <textarea 
            name="description" 
            placeholder="Descrizione opzionale" 
            onChange={handleInputChange} 
            style={{ padding: '8px', minHeight: '80px' }}
          />
          
          <hr />

          <label>File OBJ: <input type="file" name="obj_file" accept=".obj" onChange={handleFileChange} required /></label>
          <label>File MTL: <input type="file" name="mtl_file" accept=".mtl" onChange={handleFileChange} /></label>
          <label>Textures: <input type="file" name="textures" accept="image/*" multiple onChange={handleFileChange} /></label>

          <button type="submit" style={{ 
            padding: '12px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Invia e Collega al Reperto
          </button>
        </form>
        
        {status && (
          <div style={{ 
            marginTop: '20px', 
            padding: '10px', 
            borderRadius: '4px', 
            backgroundColor: status.includes('❌') ? '#ffebee' : '#e8f5e9',
            border: `1px solid ${status.includes('❌') ? '#ffcdd2' : '#c8e6c9'}`
          }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadReperto3D;