class AddScoreToBoardRows < ActiveRecord::Migration
  def change
    add_column :board_rows, :score, :numeric
  end
end
