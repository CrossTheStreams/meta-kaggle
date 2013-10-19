Resque::Server.use(Rack::Auth::Basic) do |user, password|
  password == "MetaKaggle123" 
end
