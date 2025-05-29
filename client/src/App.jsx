import { useEffect, useState } from 'react';
import './App.css';

const tg = window.Telegram.WebApp;

function App() {
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    tg.ready();
    fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData })
    })
      .then(res => res.json())
      .then(data => setUser(data));

    fetch('/api/cases')
      .then(res => res.json())
      .then(data => setCases(data));
  }, []);

  const openCase = (id) => {
    fetch('/api/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tgId: user.tgId, caseId: id })
    })
      .then(res => res.json())
      .then(data => setMessage(`Выпал: ${data.reward.name}`));
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-xl mb-4">🎁 Кейсы</h1>
      {user && <p className="mb-4">Баланс: {user.balance} 🌟</p>}
      {cases.map((c, index) => (
        <div key={index} className="mb-4 border p-4 rounded-xl">
          <img src={c.image} alt={c.name} className="w-24 h-24 object-cover mb-2" />
          <h2 className="text-lg">{c.name}</h2>
          <p>Цена: {c.price} 🌟</p>
          <button
            onClick={() => openCase(Object.keys(cases)[index])}
            className="mt-2 px-4 py-1 bg-white text-black rounded"
          >
            Открыть
          </button>
        </div>
      ))}
      {message && <div className="mt-4 text-green-400">{message}</div>}
    </div>
  );
}

export default App;