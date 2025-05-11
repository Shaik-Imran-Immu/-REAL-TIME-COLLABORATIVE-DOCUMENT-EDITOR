import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Connect to backend server (make sure it's running!)
const socket = io('http://localhost:5000');

function App() {
  const [text, setText] = useState('');

  // Load initial document and listen for updates
  useEffect(() => {
    // Load initial content
    socket.on('load-document', (documentText) => {
      setText(documentText);
    });

    // Listen for incoming changes from others
    socket.on('receive-changes', (newText) => {
      setText(newText);
    });

    // Cleanup listeners when component unmounts
    return () => {
      socket.off('load-document');
      socket.off('receive-changes');
    };
  }, []);

  // When user types, send it to server
  const handleChange = (e) => {
    const newValue = e.target.value;
    setText(newValue);
    socket.emit('send-changes', newValue); // Emit to backend
  };

  return (
    <div style={{ padding: '30px' }}>
      <h1>📝 Collaborative Document Editor</h1>
      <textarea
        style={{ width: '100%', height: '300px', fontSize: '16px' }}
        value={text}
        onChange={handleChange}
        placeholder="Start typing..."
      />
    </div>
  );
}

export default App;
