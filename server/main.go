package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"log"
	"html/template"
	"net/http"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"strings"
)

type user struct{
	gorm.Model
	Username string
	Password string
	Email 	 string
}

func hashAndSalt(passwd string) string {
	// convert string type password to byte array	
	pwd := []byte(passwd)

    // Use GenerateFromPassword to hash & salt pwd.
    // MinCost is just an integer constant provided by the bcrypt
    // package along with DefaultCost & MaxCost. 
    // The cost can be any value you want provided it isn't lower
    // than the MinCost (4)
    hash, err := bcrypt.GenerateFromPassword(pwd, bcrypt.MinCost)
    if err != nil {
        log.Println(err)
    }
    // GenerateFromPassword returns a byte slice so we need to
    // convert the bytes to a string and return it
    return string(hash)
}

func comparePasswords(hashedPwd string, plainPasswd string) bool {
	// convert input and hashed paswords from string to byte array
	plainPwd, byteHash := []byte(plainPasswd), []byte(hashedPwd)

    err := bcrypt.CompareHashAndPassword(byteHash, plainPwd)
    if err != nil {
        log.Println(err)
        return false
    }
    
    return true
}

func showLogin(w http.ResponseWriter, r *http.Request) {
	//fmt.Println("method is : ", r.Method)
	if r.Method == "GET" {
		t, _ := template.ParseFiles("./login_template/login.html")
		t.Execute(w, nil)
	} else {
		r.ParseForm()
		uname := r.Form["username"][0]
		db, err := gorm.Open("mysql", "phpmyadmin:qwerty123@/a1?charset=utf8&parseTime=True&loc=Local")
		if err != nil {
			panic(err)
		}
		var new_user user
		// Get first matched record
		if db.Table("userdb").Where("username = ?", uname).First(&new_user).RecordNotFound() {
		 	fmt.Println("Please check entered username", uname)
		} else {
			// call comparePasswords to compare input password 
			entered_pass := r.Form["password"][0]
			actual_password := new_user.Password
			if comparePasswords(actual_password, entered_pass) {
				fmt.Println("YAYYY")
			} else {
				fmt.Println("wrong password entered")
			}
		}
		// //// SELECT * FROM users WHERE username = uname limit 1;
		defer db.Close()
	}
}

func showReg(w http.ResponseWriter, r *http.Request){
	//fmt.Println("method is :", r.Method)

	if r.Method == "GET" {
		t, _ := template.ParseFiles("./login_template/register.html")
		t.Execute(w, nil)
	} else {
		r.ParseForm()
		uname, umail, pass1, pass2 := r.Form["username"], r.Form["email"], r.Form["pass1"][0], r.Form["pass2"][0]

		// check if both passwords entered were same
		// to be done on client-side
		if (strings.Compare(pass1,pass2) == 0) {

			// convert entered password to hash and Salted version
			final_pass := hashAndSalt(pass1)

			// connect to DB
			db, err := gorm.Open("mysql", "phpmyadmin:qwerty123@/a1?charset=utf8&parseTime=True&loc=Local")
			if err != nil { panic(err) }

			// Create a table with struct user's definition
			// If it doesnt already exist in the current DB 
			if (db.HasTable("userdb")) {

				//convert type []string to type string
				uname, umail := uname[0], umail[0]

				var temp_user user
				if db.Table("userdb").Where("email = ?", umail).First(&temp_user).RecordNotFound() {
					// unique username was entered
					var temp_user user
					if db.Table("userdb").Where("username = ?", uname).First(&temp_user).RecordNotFound() {
						// unique email id was also entered

						// create the new user object
						new_user := user {
							Username: uname,
							Password: final_pass,
							Email: umail,
						}

						// feed the new user into the DB
						db.Table("userdb").Create(&new_user)
					} else  {
						fmt.Println("An account with the username "+uname+" already exists, please enter another username")
					}
				} else {
					fmt.Println("An id with the email "+umail+"already exists, you may want to use the forgot password option.")
				}
				// rows, err := db.Table("userdb").Select("*").Rows()
				// if err != nil { panic(err) }
				// for rows.Next() {
				// 	var row user
				// 	db.ScanRows(rows, &row)
				// 	fmt.Println(row.Username, row.Password)
				// }
			} else {
				db.Table("userdb").CreateTable(&user{})
				uname, umail := uname[0], umail[0]
				new_user := user{
					Username: uname,
					Email: umail,
					Password: final_pass,
				}
				db.Table("userdb").Create(&new_user)
			}			
			defer db.Close()
		} else {
			log.Printf("Please type the same password")
		}
	}

}

func showHome(w http.ResponseWriter, r *http.Request){
	if r.Method == "GET" {
		t, _ := template.ParseFiles("./login_template/home.html")
		t.Execute(w, nil)
	}
	
}

func main() {
	http.HandleFunc("/", showHome)
	http.HandleFunc("/login/", showLogin)
	http.HandleFunc("/register/", showReg)
	http.ListenAndServe(":12345", nil)
}