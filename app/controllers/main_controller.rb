class MainController < ApplicationController

  def index    
    @comps = Competition.active
  end

end
