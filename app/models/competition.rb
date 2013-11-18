class Competition < ActiveRecord::Base

  include Delay

  default_scope { order('id ASC') }

  attr_accessible :name

  has_many :leader_boards
  has_many :teams
  
  scope :active, lambda {where("end_date > (?)", Date.today) }
  scope :inactive, lambda {where("end_date < (?)", Date.today) }


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

  def s3_obj
    s3 = AWS::S3.new
    bucket = s3.buckets['meta-kaggle']
    obj = bucket.objects[Rails.env+"/"+self.name+".csv"] 
  end

  def s3_csv=(csv_string)
    self.s3_obj.write(csv_string, {:acl => :public_read})
    # TODO: When we have the obj, we need to save the obj key.
    return
  end

  def s3_csv
    return self.s3_obj.read rescue ''
  end

  def csv_url 
    "/csv/"+self.name+".csv"
  end
  
  def competition_url
    "http://www.kaggle.com/c/"+self.name
  end

end
