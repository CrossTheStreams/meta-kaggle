class BoardRow < ActiveRecord::Base
  attr_accessible :delta, :entries, :last_submission, :leaderboard_id, :rank, :score, :team_id, :team_name
end
