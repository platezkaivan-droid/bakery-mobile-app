@echo off
echo Starting Push Server and Admin Panel...
echo.
echo Push server will run on http://localhost:3001
echo Admin panel will open in browser
echo.
echo Press Ctrl+C to stop
echo.

start "" http://localhost:3000/admin-chat.html

node admin-server.js
