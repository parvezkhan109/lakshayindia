const express = require('express');

const { getDb } = require('../../db/db');

const router = express.Router();

function requiredString(v, field) {
  const s = String(v || '').trim();
  if (!s) {
    const err = new Error(`${field} is required`);
    err.status = 400;
    throw err;
  }
  return s;
}

function optionalString(v) {
  const s = String(v || '').trim();
  return s || null;
}

// Public: registration / query submission
router.post('/queries', (req, res) => {
  try {
    const body = req.body || {};

    const name = requiredString(body.name, 'name');
    const fatherName = requiredString(body.fatherName, 'fatherName');
    const dob = requiredString(body.dob, 'dob');
    const permanentAddress = requiredString(body.permanentAddress, 'permanentAddress');
    const state = requiredString(body.state, 'state');
    const district = requiredString(body.district, 'district');
    // City removed from UI; keep DB insert compatible (column is NOT NULL).
    const city = optionalString(body.city) || '';
    const contactNumber = requiredString(body.contactNumber, 'contactNumber');
    const email = requiredString(body.email, 'email');
    const username = requiredString(body.username, 'username');
    const password = requiredString(body.password, 'password');
    const aadharCard = requiredString(body.aadharCard, 'aadharCard');
    const panCard = requiredString(body.panCard, 'panCard');

    const db = getDb();

    const info = db
      .prepare(
        `INSERT INTO queries (
            name, father_name, dob, permanent_address, state, district, city,
            contact_number, email, username, password, aadhar_card, pan_card,
            status, created_at
         ) VALUES (
            @name, @father_name, @dob, @permanent_address, @state, @district, @city,
            @contact_number, @email, @username, @password, @aadhar_card, @pan_card,
            'NEW', strftime('%Y-%m-%dT%H:%M:%fZ','now')
         )`
      )
      .run({
        name,
        father_name: fatherName,
        dob,
        permanent_address: permanentAddress,
        state,
        district,
        city,
        contact_number: contactNumber,
        email,
        username,
        password,
        aadhar_card: aadharCard,
        pan_card: panCard,
      });

    res.status(201).json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    const status = e.status || 500;
    const msg = status === 500 ? 'Internal Server Error' : e.message;
    res.status(status).json({ ok: false, error: msg });
  }
});

module.exports = router;
