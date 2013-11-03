if Rails.env == 'production'
  Rails.logger.info("+++ #{ENV["REDISTOGO_URL"]} +++")
  uri_string = "redis://redistogo:c904c8b6174eb61be226cfc8c79e5298@beardfish.redistogo.com:10700/"
  uri = URI.parse(uri_string) rescue nil
  REDIS = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
  Resque.redis = REDIS
end

