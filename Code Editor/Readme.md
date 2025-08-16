# 👨‍💻 Coder's Collab

A full-stack MERN application with real-time collaboration features using Socket.IO and a built-in code editor (Monaco Editor).
Designed for seamless developer collaboration 💡✨

---

## 📂 Project Setup

### 1️⃣ Clone the Repository

git clone [https://github.com/Mukheshkumar25/Coder-s-Collab.git](https://github.com/Mukheshkumar25/Coder-s-Collab.git)
cd Coder-s-Collab

---

### 2️⃣ Install Dependencies

#### 🔹 Client

Open a terminal and run:
cd client
npm install
npm install react react-dom react-router-dom socket.io-client axios tailwindcss @tailwindcss/vite postcss autoprefixer monaco-editor @monaco-editor/react

#### 🔹 Server

Open another terminal and run:
cd server
npm install
npm install express mongoose cors dotenv bcryptjs jsonwebtoken socket.io nodemon

---

### 3️⃣ Environment Variables ⚡

Create `.env` files in client and server directories.

server/.env
MONGO\_URI=your\_mongo\_db\_connection\_string
JWT\_SECRET=your\_secret\_key
PORT=5000

client/.env
REACT\_APP\_API\_URL=[http://localhost:5000](http://localhost:5000)

(Make sure to never commit actual `.env` files — use `.env.example` instead ✅)

---

### 4️⃣ Run the Project 🚀

#### Start Client

cd client
npm run dev

#### Start Server

cd server
npm run dev

Now open the browser at 👉 [http://localhost:5173](http://localhost:5173) (or the port Vite shows).

---

## 🛠️ Tech Stack

* Frontend: React, TailwindCSS, Axios, Monaco Editor
* Backend: Node.js, Express, Socket.IO, JWT Auth
* Database: MongoDB + Mongoose

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License

This project is licensed under the MIT License.

