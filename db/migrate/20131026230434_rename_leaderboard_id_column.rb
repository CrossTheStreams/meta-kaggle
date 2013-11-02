class RenameLeaderboardIdColumn < ActiveRecord::Migration
  def up
    rename_column :board_rows, :leaderboard_id, :leader_board_id
  end

  def down
  end
end
