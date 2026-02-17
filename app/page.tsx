"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

 useEffect(() => {
  checkUser();

  const channel = supabase
    .channel("realtime-bookmarks")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "bookmarks" },
      () => {
        checkUser(); // refresh bookmarks automatically
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      setUser(session.user);
      fetchBookmarks(session.user.id);
    }
  }

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setBookmarks([]);
  }

  async function fetchBookmarks(userId: string) {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setBookmarks(data);
  }

  async function addBookmark() {
    if (!title || !url) return;

    if (!url.startsWith("http")) {
      alert("Enter valid URL (start with http)");
      return;
    }

    const { error } = await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ]);

    if (!error) {
      setTitle("");
      setUrl("");
      fetchBookmarks(user.id);
    }
  }

  async function deleteBookmark(id: string) {
    await supabase.from("bookmarks").delete().eq("id", id);
    fetchBookmarks(user.id);
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "200px" }}>
        <button
          onClick={signIn}
          style={{
            padding: "12px 24px",
            background: "black",
            border: "1px solid white",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1>📌 Smart BookMarks</h1>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />

        <input
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />

        <button
          onClick={addBookmark}
          style={{
            background: "green",
            color: "white",
            padding: "8px 16px",
            border: "none",
          }}
        >
          Add
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {bookmarks.length === 0 && (
          <p style={{ color: "gray" }}>No bookmarks yet</p>
        )}

        {bookmarks.map((b) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              border: "1px solid #444",
              padding: 10,
              marginTop: 10,
              borderRadius: 6,
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <img
                src={`https://www.google.com/s2/favicons?domain=${b.url}`}
                width="16"
                height="16"
              />

              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "white" }}
              >
                {b.title}
              </a>
            </div>

            <button
              onClick={() => deleteBookmark(b.id)}
              style={{
                background: "transparent",
                color: "red",
                border: "none",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <p
        onClick={logout}
        style={{ marginTop: 30, color: "gray", cursor: "pointer" }}
      >
        Logout
      </p>
    </div>
  );
}
