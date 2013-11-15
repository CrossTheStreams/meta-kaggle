class AddErrorBasedToCompetitions < ActiveRecord::Migration
  def change
    add_column :competitions, :error_based, :boolean
  end
end
