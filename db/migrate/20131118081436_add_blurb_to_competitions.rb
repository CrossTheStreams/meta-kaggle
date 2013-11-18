class AddBlurbToCompetitions < ActiveRecord::Migration
  def change
    add_column :competitions, :blurb, :string
  end
end
