#!/bin/bash

# Capture the absolute path of your project root
PROJECT_ROOT=$(pwd)

# Run AppleScript to control iTerm2
osascript <<EOF
-- First, get the exact dimensions of your screen
tell application "Finder"
    set screenBounds to bounds of window of desktop
end tell

tell application "iTerm"
    activate
    
    -- Create a brand new window for this project
    set newWindow to (create window with default profile)
    
    -- Maximize the window to fill the screen
    set bounds of newWindow to screenBounds
    
    -- Tab 1: Agent Server
    tell current session of newWindow
        set name to "Agent API"
        write text "cd \"$PROJECT_ROOT/agent\" && source env/bin/activate && python3 app.py"
    end tell
    
    -- Tab 2: Backend Server
    tell newWindow
        create tab with default profile
        tell current session
            set name to "Backend API"
            write text "cd \"$PROJECT_ROOT/backend\" && source env/bin/activate && python3 app.py"
        end tell
    end tell
    
    -- Tab 3: Kafka Consumer
    tell newWindow
        create tab with default profile
        tell current session
            set name to "Kafka Consumer"
            write text "cd \"$PROJECT_ROOT/backend\" && source env/bin/activate && python3 consumer_app.py"
        end tell
    end tell
    
end tell
EOF

echo "iTerm2 window launched and maximized with all services running!"