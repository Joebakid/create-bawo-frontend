// utils.ts for shadcn projects
const CN_UTIL_TS = `
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
`.trim();

const COMPONENTS_JSON_VITE = `
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "tailwind.config.cjs", "css": "src/styles/index.css", "baseColor": "slate", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils" }
}
`.trim();

const COMPONENTS_JSON_NEXT = `
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": { "config": "tailwind.config.cjs", "css": "app/globals.css", "baseColor": "slate", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils" }
}
`.trim();

const FRAMER_DEMO_REACT = `
import { motion } from "framer-motion";
export default function FramerDemo() {
  return (
    <div className="mt-6 flex gap-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120 }} className="h-12 w-12 rounded-lg bg-blue-500" />
      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} className="rounded border px-3 py-1">Framer Motion</motion.button>
    </div>
  );
}
`.trim();

const GSAP_DEMO_REACT_TS = `
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
export default function GsapDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (boxRef.current) { gsap.from(boxRef.current, { y: -30, opacity: 0, duration: 0.6, ease: "power2.out" }); } }, []);
  return <div className="mt-6"><div ref={boxRef} className="h-12 w-12 rounded-lg bg-emerald-500" /></div>;
}
`.trim();

const GSAP_DEMO_REACT_JS = `
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
export default function GsapDemo() {
  const boxRef = useRef(null);
  useEffect(() => { if (boxRef.current) { gsap.from(boxRef.current, { y: -30, opacity: 0, duration: 0.6, ease: "power2.out" }); } }, []);
  return <div className="mt-6"><div ref={boxRef} className="h-12 w-12 rounded-lg bg-emerald-500" /></div>;
}
`.trim();

const FRAMER_DEMO_NEXT = `
"use client";
import { motion } from "framer-motion";
export default function FramerDemo() {
  return (
    <div className="mt-6 flex gap-4">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120 }} className="h-12 w-12 rounded-lg bg-blue-500" />
      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} className="rounded border px-3 py-1">Framer Motion</motion.button>
    </div>
  );
}
`.trim();

const GSAP_DEMO_NEXT = `
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
export default function GsapDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (boxRef.current) { gsap.from(boxRef.current, { y: -30, opacity: 0, duration: 0.6, ease: "power2.out" }); } }, []);
  return <div className="mt-6"><div ref={boxRef} className="h-12 w-12 rounded-lg bg-emerald-500" /></div>;
}
`.trim();

const GSAP_DEMO_NEXT_JS = `
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
export default function GsapDemo() {
  const boxRef = useRef(null);
  useEffect(() => {
    if (boxRef.current) {
      gsap.from(boxRef.current, { y: -30, opacity: 0, duration: 0.6, ease: "power2.out" });
    }
  }, []);
  return <div className="mt-6"><div ref={boxRef} className="h-12 w-12 rounded-lg bg-emerald-500" /></div>;
}
`.trim();

// Redux demos & store pieces
const REDUX_DEMO_JS = `
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, reset } from '../../store/counterSlice';

export default function ReduxDemo() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Redux Counter</h3>
      <div className="flex items-center gap-4">
        <span className="text-xl font-mono">{count}</span>
        <button onClick={() => dispatch(increment())} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">+</button>
        <button onClick={() => dispatch(decrement())} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">-</button>
        <button onClick={() => dispatch(reset())} className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">Reset</button>
      </div>
    </div>
  );
}
`.trim();

const RTK_QUERY_DEMO_JS = `
import React from 'react';
import { useGetPostsQuery, useGetPostQuery } from '../../store/api';

export default function RTKQueryDemo() {
  const { data: posts, error, isLoading } = useGetPostsQuery();
  const { data: post } = useGetPostQuery(1);
  if (isLoading) return <div className="mt-6">Loading posts...</div>;
  if (error) return <div className="mt-6 text-red-500">Error loading posts</div>;
  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-3">RTK Query Demo</h3>
      <div className="space-y-2">
        <div className="text-sm text-gray-600">First post: {post?.title}</div>
        <div className="text-sm">Total posts: {posts?.length}</div>
      </div>
    </div>
  );
}
`.trim();

const REACT_QUERY_DEMO_JS = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
const fetchPosts = async () => (await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')).json();
export default function ReactQueryDemo() {
  const { data: posts, isLoading, error } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
  if (isLoading) return <div className="mt-6">Loading posts...</div>;
  if (error) return <div className="mt-6 text-red-500">Error: {error.message}</div>;
  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-3">React Query Demo</h3>
      <div className="space-y-2">
        {posts?.slice(0, 3).map((post) => <div key={post.id} className="text-sm p-2 bg-gray-50 rounded">{post.title}</div>)}
      </div>
    </div>
  );
}
`.trim();

const SWR_DEMO_JS = `
import React from 'react';
import useSWR from 'swr';
const fetcher = (url) => fetch(url).then((r) => r.json());
export default function SWRDemo() {
  const { data, error, isLoading } = useSWR('https://jsonplaceholder.typicode.com/users?_limit=3', fetcher);
  if (error) return <div className="mt-6 text-red-500">Failed to load</div>;
  if (isLoading) return <div className="mt-6">Loading users...</div>;
  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-3">SWR Demo</h3>
      <div className="space-y-2">
        {data?.map((u) => <div key={u.id} className="text-sm p-2 bg-gray-50 rounded">{u.name} - {u.email}</div>)}
      </div>
    </div>
  );
}
`.trim();

const CONTEXT_DEMO_JS = `
import React, { createContext, useContext, useReducer } from 'react';
const ThemeContext = createContext();
const themeReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME': return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    case 'SET_USER': return { ...state, user: action.payload };
    default: return state;
  }
};
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, { theme: 'light', user: null });
  return <ThemeContext.Provider value={{ state, dispatch }}>{children}</ThemeContext.Provider>;
};
export default function ContextDemo() {
  const { state, dispatch } = useContext(ThemeContext);
  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Context API + useReducer Demo</h3>
      <div className="space-y-3">
        <div className="text-sm">Current theme: <span className="font-mono">{state.theme}</span></div>
        <button onClick={() => dispatch({ type: 'TOGGLE_THEME' })} className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">Toggle Theme</button>
      </div>
    </div>
  );
}
`.trim();

const ROUTER_DEMO_JS = `
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
const Home = () => (<div className="p-4"><h2 className="text-xl font-semibold">Home Page</h2><p className="mt-2 text-gray-600">Welcome to the home page!</p></div>);
const About = () => (<div className="p-4"><h2 className="text-xl font-semibold">About Page</h2><p className="mt-2 text-gray-600">This is the about page.</p></div>);
const Navigation = () => { const navigate = useNavigate(); return (
  <nav className="flex gap-4 p-4 bg-gray-100 rounded">
    <Link to="/" className="text-blue-500 hover:text-blue-700">Home</Link>
    <Link to="/about" className="text-blue-500 hover:text-blue-700">About</Link>
    <button onClick={() => navigate('/about')} className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Navigate to About</button>
  </nav>); };
export default function RouterDemo() {
  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-3">React Router Demo</h3>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </div>
  );
}
`.trim();

const USESTATE_DEMO_JS = `
import React, { useState, useEffect } from 'react';
export default function UseStateDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [todos, setTodos] = useState([]);
  useEffect(() => { setTodos([{ id: 1, text: 'Learn React', completed: false }, { id: 2, text: 'Build awesome apps', completed: true }]); }, []);
  const addTodo = () => { if (name.trim()) { setTodos([...todos, { id: Date.now(), text: name, completed: false }]); setName(''); } };
  return (
    <div className="mt-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-3">useState + useEffect Demo</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-4"><span>Counter: {count}</span><button onClick={() => setCount(count + 1)} className="px-2 py-1 bg-green-500 text-white rounded text-sm">+1</button></div>
        <div className="flex gap-2"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Add todo..." className="px-2 py-1 border rounded flex-1" /><button onClick={addTodo} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Add</button></div>
        <div className="space-y-1">{todos.map((t) => <div key={t.id} className="text-sm p-2 bg-gray-50 rounded">{t.text} {t.completed && '✓'}</div>)}</div>
      </div>
    </div>
  );
}
`.trim();

const REDUX_STORE_JS = `
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
`.trim();

const REDUX_STORE_JS_TAIL = `
export const store = configureStore({
  reducer: {
    counter: counterReducer,{{API_REDUCER}}
  },{{API_MIDDLEWARE}}
});
export default store;
`.trim();

const COUNTER_SLICE_JS = `
import { createSlice } from '@reduxjs/toolkit';
const initialState = { value: 0 };
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
    reset: (state) => { state.value = 0; },
  },
});
export const { increment, decrement, reset } = counterSlice.actions;
export default counterSlice.reducer;
`.trim();

const RTK_API_JS = `
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
  endpoints: (b) => ({
    getPosts: b.query({ query: () => 'posts?_limit=5' }),
    getPost:  b.query({ query: (id) => \`posts/\${id}\` }),
  }),
});
export const { useGetPostsQuery, useGetPostQuery } = api;
`.trim();

module.exports = {
  CN_UTIL_TS,
  COMPONENTS_JSON_VITE,
  COMPONENTS_JSON_NEXT,
  FRAMER_DEMO_REACT,
  GSAP_DEMO_REACT_TS,
  GSAP_DEMO_REACT_JS,
  FRAMER_DEMO_NEXT,
  GSAP_DEMO_NEXT,
  GSAP_DEMO_NEXT_JS,
  REDUX_DEMO_JS,
  RTK_QUERY_DEMO_JS,
  REACT_QUERY_DEMO_JS,
  SWR_DEMO_JS,
  CONTEXT_DEMO_JS,
  ROUTER_DEMO_JS,
  USESTATE_DEMO_JS,
  REDUX_STORE_JS,
  REDUX_STORE_JS_TAIL,
  COUNTER_SLICE_JS,
  RTK_API_JS,
};
