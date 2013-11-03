namespace :scrape do

  task "fetch_competitions" => :environment do 
    Scrape.fetch_competitions
  end

end


