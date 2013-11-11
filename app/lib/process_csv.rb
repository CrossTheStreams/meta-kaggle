class ProcessCSV

  require 'csv'

  def self.competition_csv!(competition)

    lbs = competition.leader_boards.order('id DESC')

    # bucket for all scores
    dates = []
    team_scores = {}

    all_team_names = []

    lbs.each_with_index do |lb, i|

      # array of hashes {"score" => "0.90" (string), "team_name => "Team Awesome"}
      date = lb.created_at.strftime('%Y%m%d')
      dates << date
      lb_scores = {}
      
      LeaderBoard.pluck_all(lb.board_rows,:team_name,:score).map(&:values).map {|a| lb_scores[a[0]] = a[1]}

      if i == 0
        all_team_names = lb_scores.keys.sort
      end

      all_team_names.each do |tn|
        score = lb_scores[tn]
        score = "-1" if score.nil?
        team_scores[tn] ||= []
        team_scores[tn].push(score) 
      end 

    end

    # TODO: set configurable limit on teams

    csv_string = CSV.generate do |csv|
      all_team_names_length = all_team_names.length
      csv << all_team_names.unshift("date")
      dates.each_with_index do |date, idx|
        csv << [date].concat(team_scores.values.map {|s| s[idx]})
      end
    end  

    # Upload to S3
    competition.s3_csv = csv_string

  end
  

end
