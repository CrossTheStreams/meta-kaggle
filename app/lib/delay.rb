module Delay
  extend ActiveSupport::Concern

  # include class methods here
  # like User.delay.method
  module ClassMethods

    def async(method, queue='default', *args)
      # Rails.logger.debug("class method #{method}, q = #{queue}, args #{args.inspect}, self = #{self.class}")
      Resque::Job.create(queue, self, method, nil, *args)
    end

    def async_in(seconds, method, queue='default', *args)
      Resque.enqueue_in_with_queue(queue, seconds, self, method, nil, *args) 
    end

    # as_time_with_zone : ActiveSupport::TimeWithZone instance : e.g. 5.days.from_now
    def async_at(as_time_with_zone, method, queue='default', *args)
      Resque.enqueue_at_with_queue(queue, as_time_with_zone, self, method, nil, *args)  
    end


    # https://github.com/defunkt/resque
    # https://github.com/loopj/resque-delayable/blob/master/lib/resque-delayable.rb
    # https://github.com/rykov/resque-delay/blob/master/lib/resque_delay/performable_method.rb
    def perform(method,id=nil, *args)
      # Rails.logger.debug("in perform(#{method},#{id}, #{args.inspect})")
      begin
        unless id.nil?
          self.find(id).send(method,*args)
        else
        # class method invocation
          self.send(method,*args)
        end
      rescue Exception=>e
        raise e.message
      end
      # Yeah - it sucks, but because of forking we need to explicitly close the connection to database to avoid PGSQL errors.
      ActiveRecord::Base.connection.disconnect!
    end
  end

  # include Instance methods
  # like @user.delay.popularity
  # module InstanceMethods is now deprecated
  
    def async(method, queue='default', *args)
      # Rails.logger.debug("instance method #{method}, id #{id}, q = #{queue}, args #{args.inspect}, self = #{self.class}")
      Resque::Job.create(queue, self.class, method, self.id, *args)
    end

    def async_in(seconds, method, queue='default', *args)
      Resque.enqueue_in_with_queue(queue, seconds, self.class, method, self.id, *args) 
    end

    # as_time_with_zone : ActiveSupport::TimeWithZone instance : e.g. 5.days.from_now
    def async_at(as_time_with_zone, method, queue='default', *args)
      Resque.enqueue_at_with_queue(queue, as_time_with_zone, self.class, method, self.id, *args)  
    end
    
  # end
end

