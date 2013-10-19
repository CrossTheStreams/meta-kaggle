class CreateLeaderBoards < ActiveRecord::Migration
  def change
    create_table :leader_boards do |t|
      t.integer :competition_id
      t.timestamps
    end
  end
end
