package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/models"
	u "server/utils"
	"strconv"
)

var CreateProject = func(w http.ResponseWriter, r *http.Request) {

	project := &models.Project{}

	err := json.NewDecoder(r.Body).Decode(project)
	if err != nil {
		u.Respond(w, u.Message(false, "Error while decoding request body"))
		return
	}

	user_id := r.Context().Value("user").(uint)
	creator := int(user_id)

	resp := project.Create(creator)
	u.Respond(w, resp)
}

var GetProjectsFor = func(w http.ResponseWriter, r *http.Request) {

	temp_id := r.Context().Value("user").(uint)
	id := int(temp_id)
	data := models.GetAllProjects(id)
	resp := u.Message(true, "success")
	resp["projects"] = data
	u.Respond(w, resp)
}

// add a user to a project
var AddUserToProject = func(w http.ResponseWriter, r *http.Request) {

	// extract IDs of project and user to be added
	// from the header as string
	proj_id_str, user_id_str := r.Header.Get("project_id"), r.Header.Get("user_id")

	// extract the id of the user trying to add
	// another user to this project
	temp_user_id := r.Context().Value("user").(uint)
	sender_user_id := int(temp_user_id)

	// convert project and user id from string to int
	proj_id, err := strconv.Atoi(proj_id_str)
	if err != nil {
		panic(err)
	}
	user_id, err := strconv.Atoi(user_id_str)
	if err != nil {
		panic(err)
	}
	fmt.Println(proj_id, user_id, sender_user_id)
	resp := models.AddUserProjectToDb(proj_id, user_id, sender_user_id)
	u.Respond(w, resp)
}
