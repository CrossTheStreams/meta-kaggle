class AddEndDateToCompetitions < ActiveRecord::Migration
  def change
    add_column :competitions, :end_date, :datetime
  end
end
