-- Migration: Enable realtime on all main tables
-- Run this in Supabase SQL Editor to enable realtime updates

-- Enable realtime publication for all main tables
ALTER PUBLICATION supabase_realtime ADD TABLE courts;
ALTER PUBLICATION supabase_realtime ADD TABLE court_suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE match_players;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE follows;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Note: If any table doesn't exist, comment out that line
-- The above commands will fail silently if the table is already in the publication
