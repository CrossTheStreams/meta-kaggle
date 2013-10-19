class CreateBoardRows < ActiveRecord::Migration
  def change

    create_table :board_rows do |t|
      t.integer :leaderboard_id
      t.integer :rank
      t.integer :delta
      t.string :team_name
      t.integer :team_id
      t.integer :entries
      t.datetime :last_submission
      t.timestamps
    end
  end
end
