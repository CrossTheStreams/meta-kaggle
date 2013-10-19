class CreateScrapes < ActiveRecord::Migration
  def change
    create_table :scrapes do |t|

      t.timestamps
    end
  end
end
