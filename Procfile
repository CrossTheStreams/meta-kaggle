web: bundle exec rackup config.ru -p $PORT
resque: env QUEUES=kaggle_scrape, lb_scrape bundle exec rake resque:work
