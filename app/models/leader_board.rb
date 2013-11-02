class LeaderBoard < ActiveRecord::Base

  include MultiPluck

  attr_accessible :competition_id

  has_many :board_rows
  belongs_to :competition

  

end
