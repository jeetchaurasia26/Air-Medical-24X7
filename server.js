require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '200kb' }));

const ZOHO_TOKEN = process.env.ZOHO_ACCESS_TOKEN; // set on server env
const ZOHO_API_BASE = process.env.ZOHO_API_BASE || 'https://www.zohoapis.com'; // change region if needed
const ZOHO_MODULE = process.env.ZOHO_MODULE || 'Leads'; // default Leads

if (!ZOHO_TOKEN) {
  console.error('1000.dac508c77aa6839d6a8191d51004620a.1a4b6e38fdb0aac4f707bb733de26a54');
  process.exit(1);
}

/* -- basic server-side validation functions (same rules as frontend) -- */
function isPlace(val) {
  return typeof val === 'string' && /^[A-Za-z .,'-]{3,}$/.test(val);
}
function isName(val) {
  return typeof val === 'string' && /^[A-Za-z ]{2,}$/.test(val);
}
function isPhone(val) {
  if (typeof val !== 'string') return false;
  const digits = val.replace(/\D/g,'');
  return digits.length >= 7 && digits.length <= 15;
}

app.post('/api/lead', async (req, res) => {
  try {
    const { service, from, destination, name, phone, source } = req.body || {};
    // Validate
    if (!service || !isPlace(from) || !isPlace(destination) || !isName(name) || !isPhone(phone)) {
      return res.status(400).json({ success:false, message:'Validation failed' });
    }

    // Prepare Zoho lead payload
    // Zoho requires Last_Name for leads; map name -> Last_Name
    const record = {
      Last_Name: name,
      Company: 'Individual', // required by some orgs; change if you want
      City: from,
      // If you have a custom field API name for Destination, change below:
      Destination_City: destination,
      Phone: phone,
      Description: `Service: ${service} (source:${source||'Chatbot'})`,
      Lead_Source: source || 'Chatbot Lead'
    };

    // Zoho API insert records endpoint (v2)
    const url = `${ZOHO_API_BASE}/crm/v2/${ZOHO_MODULE}`;
    const headers = {
      'Authorization': `Zoho-oauthtoken ${ZOHO_TOKEN}`,
      'Content-Type': 'application/json'
    };

    const payload = { data: [ record ], trigger: [] };

    const zohoResp = await axios.post(url, payload, { headers });
    // zoho returns details in zohoResp.data
    if (zohoResp.data && zohoResp.data.data && zohoResp.data.data[0].code === 'SUCCESS') {
      return res.json({ success:true, zoho: zohoResp.data });
    } else {
      // forward Zoho response for debugging
      return res.status(500).json({ success:false, zoho: zohoResp.data });
    }

  } catch (err) {
    console.error('Error /api/lead:', err?.response?.data || err.message || err);
    return res.status(500).json({ success:false, error: err?.response?.data || err.message });
  }
});

/* health */
app.get('/ping', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on port', PORT));
