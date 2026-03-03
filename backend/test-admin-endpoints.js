const axios = require('axios');
(async () => {
try {
  const login = await axios.post('http://localhost:5000/api/auth/admin-login', { phone: '9999999999', password: '55555' });
  console.log('Login successful:', login.data.token.substring(0, 10) + '...');
  
  const token = login.data.token;
  try {
    await axios.get('http://localhost:5000/api/auth/admin/users', { headers: { Authorization: 'Bearer ' + token } });
    console.log('Users fetch success');
  } catch(e) { console.error('Users fetch failed', e.response?.status, e.response?.data); }

  try {
    await axios.get('http://localhost:5000/api/subscriptions/admin/all', { headers: { Authorization: 'Bearer ' + token } });
    console.log('Subs fetch success');
  } catch(e) { console.error('Subs fetch failed', e.response?.status, e.response?.data); }

  try {
    await axios.get('http://localhost:5000/api/orders/admin/all', { headers: { Authorization: 'Bearer ' + token } });
    console.log('Orders fetch success');
  } catch(e) { console.error('Orders fetch failed', e.response?.status, e.response?.data); }
  
} catch (e) {
  console.log('Login failed', e.response?.status, e.response?.data);
}
})();
