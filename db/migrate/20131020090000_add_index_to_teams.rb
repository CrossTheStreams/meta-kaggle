class AddIndexToTeams < ActiveRecord::Migration
  def change
    add_index :teams, [:name, :competition_id], :unique => true
  end
end
