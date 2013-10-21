class LeaderBoard < ActiveRecord::Base

  attr_accessible :competition_id

  has_many :board_rows
  belongs_to :competitions

  

end
