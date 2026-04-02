const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

exports.getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY name');
    res.json({ success: true, users });
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Email already registered' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const hashed = await bcrypt.hash(password, 10);
    const allowedRole = ['Admin','Manager','Employee'].includes(role) ? role : 'Employee';
    const [result] = await pool.query('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)', [name, email, hashed, allowedRole]);
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'User created successfully', user: rows[0] });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    await pool.query('UPDATE users SET name=?, role=? WHERE id=?', [name, role, id]);
    res.json({ success: true, message: 'User updated' });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};
