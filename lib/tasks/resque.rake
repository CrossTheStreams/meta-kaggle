require 'resque/tasks'

task "resque:setup" => :environment do

  Rails.logger.info("=====================\nResque Worker Setup\n=====================")
  
  ENV['QUEUE'] ||= '*'

  Resque.redis = ENV['REDIS_URI']
   
  #for redistogo on heroku http://stackoverflow.com/questions/2611747/rails-resque-workers-fail-with-pgerror-server-closed-the-connection-unexpectedl
  
  Resque.before_fork = Proc.new { ActiveRecord::Base.establish_connection }
  
  Resque.after_fork do |worker|
    # We need to re-establish the connection to db after forking the child.
    ActiveRecord::Base.establish_connection
  end

end


desc "Alias for resque:work (To run workers on Heroku)"
task "jobs:work" => "resque:work"
