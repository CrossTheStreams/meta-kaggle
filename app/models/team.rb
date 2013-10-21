class Team < ActiveRecord::Base
  attr_accessible :name

  has_many :board_rows
  belongs_to :competition

end
