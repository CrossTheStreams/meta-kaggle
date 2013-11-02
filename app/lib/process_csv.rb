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
        all_team_names = lb_scores.keys
      end

      all_team_names.each do |tn|
        score = lb_scores[tn]
        score = "-1" if score.nil?
        team_scores[tn] ||= []
        team_scores[tn].push(score) 
      end 

    end

    # TODO: Magically turn this data into a CSV!
    csv_string = CSV.generate do |csv|
      csv << all_team_names.unshift("date")
      csv << (1..all_team_names.length).to_a.reverse.unshift("ranks").join(",")
      dates.each_with_index do |date, idx|
        csv << [date].concat(team_scores.values.map {|s| s[idx]})
      end
    end  

    # Upload to S3
    aws_obj = competition.write_csv_to_s3(csv_string)

    return aws_obj

  end
  

end
