package controllers

import (
	"encoding/json"
	"fmt"
	"my_app/models"
	u "my_app/utils"
	"net/http"
	"reflect"
	"strconv"

	"github.com/gorilla/mux"
)

var CreateProject = func(w http.ResponseWriter, r *http.Request) {

	project := &models.Project{}
	user_id := int(r.Context().Value("user").(uint))

	err := json.NewDecoder(r.Body).Decode(project)
	if err != nil {
		u.Respond(w, u.Message(false, "Error while decoding request body"))
		return
	}

	resp := project.Create(user_id)
	u.Respond(w, resp)
}

var GetProjectsFor = func(w http.ResponseWriter, r *http.Request) {

	user_id := int(r.Context().Value("user").(uint))
	fmt.Println(user_id)
	data := models.GetAllProjects(user_id)
	resp := u.Message(true, "success")
	resp["projects"] = data
	u.Respond(w, resp)
}

// add a user to a project
var AddUserToProject = func(w http.ResponseWriter, r *http.Request) {

	// extract IDs of project and user to be added
	// from the header as string
	params := mux.Vars(r)

	// extract the id of the user trying to add
	// another user to this project
	sender_id := int(r.Context().Value("user").(uint))

	// convert project and user id from string to int
	project_id, err := strconv.Atoi(params["project_id"])
	if err != nil {
		panic(err)
	}
	user_id, err := strconv.Atoi(params["user_id"])
	if err != nil {
		panic(err)
	}
	resp := models.AddUserProjectToDb(project_id, user_id, sender_id)
	u.Respond(w, resp)
}

// delete a user from a project
var DeleteUserFromProject = func(w http.ResponseWriter, r *http.Request) {

	// extract IDs of project and user to be added
	// from the header as string
	params := mux.Vars(r)

	// extract the id of the user trying to add
	// another user to this project
	sender_id := int(r.Context().Value("user").(uint))

	// convert project and user id from string to int
	project_id, err := strconv.Atoi(params["project_id"])
	if err != nil {
		panic(err)
	}
	user_id, err := strconv.Atoi(params["user_id"])
	if err != nil {
		panic(err)
	}
	resp := models.DeleteUserProjectFromDb(project_id, user_id, sender_id)
	u.Respond(w, resp)
}

// get all participants of a project
var GetParticipants = func(w http.ResponseWriter, r *http.Request) {

	params := mux.Vars(r)
	project_id, err := strconv.Atoi(params["id"])
	if err != nil {
		panic(err)
	}
	fmt.Println(reflect.TypeOf(project_id))
	resp := models.GetProjectParticipants(project_id)
	u.Respond(w, resp)

}

var DeleteProject = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	user_id := int(r.Context().Value("user").(uint))
	project_id, err := strconv.Atoi(params["id"])
	fmt.Println(project_id, user_id)
	if err != nil {
		fmt.Println(err)
		u.Respond(w, u.Message(false, "problem converting project id specified at header"))
	}
	resp := models.DeleteProjects(user_id, project_id)

	u.Respond(w, resp)
}

var UpdateProject = func(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)

	updated_project := &models.Project{}

	user_id := int(r.Context().Value("user").(uint))
	fmt.Println(user_id)

	project_id, err := strconv.Atoi(params["id"])

	if err != nil {
		fmt.Println(err)
		u.Respond(w, u.Message(false, "problem converting project id specified at header"))
	}

	if err := json.NewDecoder(r.Body).Decode(updated_project); err != nil {
		fmt.Println(err)
		u.Respond(w, u.Message(false, "Error while decoding request body"))
		return
	}

	resp := models.UpdateProjects(project_id, updated_project)
	u.Respond(w, resp)
}
