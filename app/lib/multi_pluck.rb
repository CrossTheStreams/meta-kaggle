require 'active_support/concern'

# http://meltingice.net/2013/06/11/pluck-multiple-columns-rails/

module MultiPluck

  extend ActiveSupport::Concern

  # e.g. Post.pluck_all(Post.where(category: 'cats'), :id, :created_at)
    
  included do
    def self.pluck_all(relation, *args)
      connection.select_all(relation.select(args))
    end 
  end 

end
