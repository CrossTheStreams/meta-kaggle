class CompetitionController < ApplicationController

  def show
    @comp = Competition.find_by_name(params[:name])
    if @comp
      render '/competition/show' and return
    else
      render '/main/index' and return
    end
  end

end

