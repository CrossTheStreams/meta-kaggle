web: bundle exec rackup config.ru -p $PORT
resque: env QUEUES=fetch_lb bundle exec rake resque:work
