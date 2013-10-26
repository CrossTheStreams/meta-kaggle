task "scrape:fetch_competitions" => :environment do 
  Scrape.fetch_competitions
end
