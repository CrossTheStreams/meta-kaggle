class Competition < ActiveRecord::Base

  include Delay

  default_scope { order('id ASC') }

  attr_accessible :name

  has_many :leader_boards
  has_many :teams

  def self.make!(name_string)
    comp = Competition.find_or_create_by_name(name_string) 
    comp.ensure_title
    return comp
  end

  def ensure_title
    if self.title.blank?
      self.update_attribute(:title,self.name.split("-").map(&:capitalize).join(" "))
      return self.title
    else
      return self.title
    end 
  end


  def process_csv
    ProcessCSV.competition_csv!(self)
  end

  def write_csv_to_s3(csv_string)
    s3 = AWS::S3.new
    bucket = s3.buckets['meta-kaggle']
    obj = bucket.objects[Rails.env+"/"+self.name+".csv"].write(csv_string)
    return obj
  end

  def csv_url 
    "http://meta-kaggle.s3.amazonaws.com/"+Rails.env+"/"+self.name+".csv"
  end
  


end
