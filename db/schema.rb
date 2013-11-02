# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20131102021330) do

  create_table "blood", :id => false, :force => true do |t|
    t.integer "morphno"
    t.string  "morphology", :limit => 10
    t.integer "density"
  end

  create_table "board_rows", :force => true do |t|
    t.integer  "leader_board_id"
    t.integer  "rank"
    t.integer  "delta"
    t.string   "team_name"
    t.integer  "team_id"
    t.integer  "entries"
    t.datetime "last_submission"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
    t.decimal  "score"
  end

  create_table "competitions", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.string   "title"
    t.string   "s3_obj_key"
  end

  add_index "competitions", ["name"], :name => "index_competitions_on_name", :unique => true

  create_table "competitions_scrapes", :force => true do |t|
    t.integer "competition_id"
    t.integer "scrape_id"
  end

  create_table "leader_boards", :force => true do |t|
    t.integer  "competition_id"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
  end

  create_table "matrix1", :id => false, :force => true do |t|
    t.string "rowid",    :limit => 10
    t.string "columnid", :limit => 10
    t.float  "value"
  end

  create_table "matrix2", :id => false, :force => true do |t|
    t.string "rowid",    :limit => 10
    t.string "columnid", :limit => 10
    t.float  "value"
  end

  create_table "matrix3", :id => false, :force => true do |t|
    t.string "rowid",    :limit => 10
    t.string "columnid", :limit => 10
    t.float  "value"
  end

  create_table "order_items", :id => false, :force => true do |t|
    t.integer "id"
    t.integer "order_id"
    t.date    "order_date"
    t.integer "quantity"
  end

  create_table "orders", :id => false, :force => true do |t|
    t.integer "id"
    t.date    "order_date"
    t.integer "customer_id"
  end

  create_table "rants", :force => true do |t|
    t.text     "rant"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
    t.text     "link"
    t.string   "radix"
    t.text     "description"
    t.datetime "tweetted_at"
  end

  create_table "scrapes", :force => true do |t|
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "teams", :force => true do |t|
    t.string   "name"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
    t.integer  "competition_id"
  end

  add_index "teams", ["name", "competition_id"], :name => "index_teams_on_name_and_competition_id", :unique => true

end
