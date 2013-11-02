if Rails.env == 'production'
  uri = URI.parse(URI.encode(ENV["REDISTOGO_URL"]))
  REDIS = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
  Resque.redis = REDIS
end

