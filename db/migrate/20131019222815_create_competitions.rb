class CreateCompetitions < ActiveRecord::Migration
  def change

    create_table :competitions do |t|
      t.string :name

      t.timestamps
    end

    create_table :competitions_scrapes do |t|
      t.integer :competition_id
      t.integer :scrape_id
    end

    create_table :competitions_teams do |t|
      t.integer :competition_id
      t.integer :team_id
    end

  end

end
