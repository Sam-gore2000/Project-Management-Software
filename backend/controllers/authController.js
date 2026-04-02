const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { pool } = require('../config/db');

const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { name, email, password, role } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Email already registered.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const allowedRole = ['Admin','Manager','Employee'].includes(role) ? role : 'Employee';
    const [result] = await pool.query('INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)', [name, email, hashedPassword, allowedRole]);
    const user = { id: result.insertId, name, email, role: allowedRole };
    const token = generateToken(user);
    res.status(201).json({ success: true, message: 'Registration successful.', token, user });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, message: 'Login successful.', token, user: userWithoutPassword });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, user: rows[0] });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    res.json({ success: true, message: 'Profile updated.' });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY name');
    res.json({ success: true, users });
  } catch (err) { next(err); }
};
