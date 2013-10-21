class AddIndexToCompetitions < ActiveRecord::Migration
  def change
    add_index :competitions, :name, :unique => true
  end
end
