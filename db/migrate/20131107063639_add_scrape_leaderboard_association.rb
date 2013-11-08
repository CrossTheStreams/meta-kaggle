class AddScrapeLeaderboardAssociation < ActiveRecord::Migration
  def up
    add_column :leader_boards, :scrape_id, :integer
  end

  def down
    remove_column :leader_boards, :scrape_id
  end
end
