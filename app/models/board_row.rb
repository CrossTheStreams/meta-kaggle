class BoardRow < ActiveRecord::Base
  attr_accessible :delta, :entries, :last_submission, :leader_board_id, :rank, :score, :team_id, :team_name
  belongs_to :leader_board

  include MultiPluck


end
