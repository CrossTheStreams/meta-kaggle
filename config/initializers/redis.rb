if Rails.env == 'production'
  uri = URI.parse(ENV["REDISTOGO_URL"]) rescue nil
  if !.uri.nil?
    REDIS = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
    Resque.redis = REDIS
  end
end

