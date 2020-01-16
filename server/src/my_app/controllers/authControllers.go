package controllers

import (
	"encoding/json"
	"fmt"
	"my_app/models"
	u "my_app/utils"
	"net/http"
)

var Register = func(w http.ResponseWriter, r *http.Request) {

	account := &models.Account{}
	err := json.NewDecoder(r.Body).Decode(account) //decode the request body into struct and failed if any error occur
	if err != nil {
		u.Respond(w, u.Message(false, "Invalid request"))
		return
	}

	resp := account.Create() //Create account
	u.Respond(w, resp)
}

var Login = func(w http.ResponseWriter, r *http.Request) {

	account := &models.Account{}
	err := json.NewDecoder(r.Body).Decode(account) //decode the request body into struct and failed if any error occur
	if err != nil {
		fmt.Println(err)
		u.Respond(w, u.Message(false, "Invalid request"))
		return
	}
	fmt.Println(account.Username)
	resp := models.Login(account.Username, account.Password)
	u.Respond(w, resp)
}

var GetAllUsers = func(w http.ResponseWriter, r *http.Request) {

	data := models.GetAllUsers()
	resp := u.Message(true, "success")
	resp["accounts"] = data
	u.Respond(w, resp)
}
