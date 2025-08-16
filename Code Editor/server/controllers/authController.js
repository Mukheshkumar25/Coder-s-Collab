const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Step 1: Validate input
    if (!username || !email || !password) {
      return res.status(400).json("All fields (username, email, password) are required.");
    }

    // Step 2: Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json("User already exists with this email.");
    }

    // Step 3: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 4: Create and save new user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    return res.status(201).json("User registered");
  } catch (err) {
    console.error("Registration Error:", err); // <--- log the real error
    return res.status(500).json("Internal server error");
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json("Invalid email");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json("Invalid password");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    })
    .json({ message: "Logged in" });
};

exports.logout = (req, res) => {
  res.clearCookie("token").json("Logged out");
};

exports.getUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ isAuthenticated: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("username email"); // only send necessary fields
    if (!user) return res.json({ isAuthenticated: false });

    res.json({ isAuthenticated: true, user }); // include full user object
  } catch {
    res.json({ isAuthenticated: false });
  }
};

exports.execute = async (req, res) => {
  const { language_id, source_code, stdin } = req.body;
  const RAPID_KEY = process.env.RAPID_API_KEY;   // never hard‑code keys

  const b64   = (s = "") => Buffer.from(s, "utf8").toString("base64");
  const decode = (s) => (s ? Buffer.from(s, "base64").toString("utf8") : null);

  try {
    const judgeRes = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions" +
      "?base64_encoded=true&wait=true" +
      "&fields=stdout,stderr,compile_output,message,status",
      {
        method : "POST",
        headers: {
          "Content-Type"   : "application/json",
          "X-RapidAPI-Key" : process.env.YOUR_RAPID_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          language_id,
          source_code: b64(source_code),
          stdin      : b64(stdin || "")
        }),
      }
    );

    if (!judgeRes.ok) {
      return res.status(judgeRes.status).json({ error: "Judge0 error" });
    }

    const data = await judgeRes.json();

    res.json({
      status         : data.status?.description,
      message        : data.message,
      output         : decode(data.stdout),
      stderr         : decode(data.stderr),
      compile_output : decode(data.compile_output),
    });
  } catch (error) {
    console.error("Judge0 fetch error:", error);
    res.status(500).json({ error: "Execution error" });
  }
};