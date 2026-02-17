# Smart Bookmark App

A simple bookmark manager built with Next.js and Supabase.

## Features

✅ Google OAuth login  
✅ Add bookmarks  
✅ Private bookmarks per user  
✅ Delete bookmarks  
✅ Realtime updates  
✅ Deployed on Vercel  

## Tech Stack

- Next.js (App Router)
- Supabase (Auth, Database, Realtime)
- Tailwind CSS
- Vercel

## Live Demo

https://smart-bookmarks-virid.vercel.app

## Challenges Faced

- OAuth redirect mismatch error
- Supabase redirect URL configuration
- Row Level Security setup
- Realtime sync debugging

## How I Solved Them

- Configured Google OAuth & Supabase redirect URLs
- Implemented Supabase RLS policies for per-user privacy
- Enabled realtime replication & subscriptions
- Debugged authentication redirect flow

