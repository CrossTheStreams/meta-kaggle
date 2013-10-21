class Competition < ActiveRecord::Base
  attr_accessible :name

  has_many :teams

  def self.make!(name_string)
    Competition.find_or_create_by_name(name_string) 
  end

end
