package models

import (
	"fmt"
	"os"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"github.com/joho/godotenv"
)

var db *gorm.DB

func init() {

	e := godotenv.Load()
	if e != nil {
		fmt.Print(e)
	}

	username := os.Getenv("db_user")
	password := os.Getenv("db_pass")
	dbName := os.Getenv("db_name")
	//dbHost := os.Getenv("db_host")

	dbUri := fmt.Sprintf("%s:%s@/%s?charset=utf8&parseTime=True&loc=Local", username, password, dbName)
	fmt.Println(dbUri)

	conn, err := gorm.Open("mysql", dbUri)
	if err != nil {
		fmt.Print(err)
	}

	db = conn

	//check if the Database under use has the table name userdb
	if !db.HasTable("users") {
		db.Table("users").CreateTable(&Account{})
	}

	//check if database has projects table
	if !db.HasTable("projects") {
		db.Table("projects").CreateTable(&Project{})
	}

	//check if database has userprojects table
	if !db.HasTable("project_participants") {
		db.Table("project_participants").CreateTable(&UserProjectTable{})
	}

	// check if database has issues table
	if !db.HasTable("issues") {
		db.Table("issues").CreateTable(&Issue{})
	}

	//db.Debug().AutoMigrate(&Account{}, &Contact{})
}

func GetDB() *gorm.DB {
	return db
}
