class AddCompetitionIdToTeams < ActiveRecord::Migration

  def change
    drop_table :competitions_teams
    add_column :teams, :competition_id, :integer
  end

end
