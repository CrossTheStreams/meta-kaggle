class AddS3ObjKeyToCompetitions < ActiveRecord::Migration
  def change
    add_column :competitions, :s3_obj_key, :string
  end
end
