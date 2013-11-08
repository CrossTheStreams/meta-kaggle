class RemoveS3KeyColumn < ActiveRecord::Migration
  def up
    remove_column :competitions, :s3_obj_key
  end

  def down
    add_column :competitions, :s3_obj_key, :string
  end
end
