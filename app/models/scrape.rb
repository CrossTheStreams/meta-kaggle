class Scrape < ActiveRecord::Base
  require 'open-uri'

# coding : utf-8

  include Delay
  # attr_accessible :title, :body
  
  has_and_belongs_to_many :competitions
  has_many :leader_boards

  def self.fetch_competitions 
    
    scrape = Scrape.create

    main = Nokogiri::HTML(open("http://www.kaggle.com/competitions"),nil,'ascii')

    comp_links = main.css("a.comp-link")

    comp_strings = []

    blurb_strings = []

    comp_links.map do |link| 

      href = link.attr('href')

      if href.include?("/c/") && !href.include?("titanic") && !href.include?("www")
        comp_strings << href.partition("/c/").last
      end

    end

    comp_strings.each do |str|

      competition = Competition.make!(str)
      #Scrape.async(:fetch_leaderboard,'fetch_lb',competition.id,scrape.id)
      
      scrape.competitions << competition

      end_date = competition.end_date
      
      is_active = (Date.today < competition.end_date.to_date) rescue false

      if competition.end_date.blank? || is_active
        Scrape.fetch_leaderboard(competition.id,scrape.id)
      end

      # get a blurb for description

      if competition.blurb.blank?
        comp_doc = Nokogiri::HTML(open(competition.competition_url),nil,'ascii')
        blurb = comp_doc.css('.page-name').first.text.strip rescue nil
        competition.update_attribute(:blurb,blurb) if blurb
      end

    end 

  end

  def self.fetch_leaderboard(c_id,scrape_id)

    competition = Competition.find(c_id)

    doc = Nokogiri::HTML(open('http://www.kaggle.com/c/'+competition.name+'/leaderboard'))

    competition.update_attribute(:end_date, DateTime.parse(doc.css("#comp-header-stats-end").first.text)) rescue nil

    board_rows = doc.css('#leaderboard-table tr')

    rows = []

    board_rows.each_with_index do |ele, idx|

      id = ele.attr('id')
      scan = id.scan(/team-/) rescue []

      if !scan.empty?    
        row_hash = {}
        col_arr = ele.css("td")

        # rank
        row_hash[:rank] = col_arr[0].text.to_i rescue nil

        # delta 
        # The tiny arrows used on the delta thing are weird multibyte characters. 
        # HTMLEntities is a gem that helps encode these.
        # Otherwise, things blow up for whatever reason.
        
        coder = HTMLEntities.new
        delta_str = coder.encode(col_arr[1].text.strip,:hexadecimal)
        # plus
        delta_str.gsub!("&#x2191;","+")
        # minus
        delta_str.gsub!("&#x2193;","-")

        # gimme the integer!
        delta_str.to_i

        row_hash[:delta] = delta_str.scan(/[-+0123456789]+/).first
        # name
        row_hash[:team_name] = col_arr[2].css("a.team-link").text.scan(/[(\w|\s)]*/).first.strip[0..99] rescue ''

        # score
        row_hash[:score] = col_arr[3].text.strip.to_f

        # entries
        row_hash[:entries] = col_arr[4].text.strip.to_i
        # last submission
        row_hash[:last_submission] = DateTime.parse(col_arr[5].text.strip) rescue nil

        rows << row_hash

      end

    end

    # Create LeaderBoard
    # TODO: Only one leaderboard for any given calendar date.
    leader_board = LeaderBoard.create(:competition_id => competition.id, :scrape_id => scrape_id)

    rows.each do |r|
      r[:leader_board_id] = leader_board.id
      team = Team.find_or_create_by_name_and_competition_id(r[:team_name],competition.id)
      r[:team_id] = team.id
      BoardRow.create(r)
    end

    first_score = leader_board.board_rows.order('id ASC').limit(1).pluck(:score).first
    last_score = leader_board.board_rows.order('id DESC').limit(1).pluck(:score).first

    # This contest scores accuracy by error.
    if last_score > first_score
      competition.update_attribute(:error_based, true) 
    end 

    #competition.async(:process_csv,:csv)
    competition.process_csv
  end
  
end
