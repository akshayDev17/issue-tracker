package controllers

import (
	"encoding/json"
	"fmt"
	"my_app/models"
	u "my_app/utils"
	"net/http"
	"strconv"
	"github.com/gorilla/mux"
)

var CreateIssue = func(w http.ResponseWriter, r *http.Request) {

	//Grab the id of the user that send the request
	// i.e. created the issue
	params := mux.Vars(r)
	project_id, err := strconv.Atoi(params["project_id"])
	
	user_id := int(r.Context().Value("user").(uint))
	issue := &models.Issue{}

	// json data should have the id of user to whom the issue
	// is being assigned to and the projec to which the issue
	// belongs to, along with name, description and task-type
	err = json.NewDecoder(r.Body).Decode(issue)
	if err != nil {
		fmt.Println(err)
		u.Respond(w, u.Message(false, "Error while decoding request body"))
		return
	}

	issue.CreatedBy = user_id
	issue.ProjectID = project_id 
	
	resp := issue.Create()
	u.Respond(w, resp)
}

// get issues for a project assigned to a user
var GetAllIssues = func(w http.ResponseWriter, r *http.Request) {

	params := mux.Vars(r)
	project_id, err := strconv.Atoi(params["project_id"])
	user_id := int(r.Context().Value("user").(uint))

	if err != nil {
		fmt.Println(err)
		u.Respond(w, u.Message(false, "problem converting project id specified at header"))
	}
	data := models.GetAllIssues(project_id, user_id)
	resp := u.Message(true, "success")
	resp["issues"] = data
	u.Respond(w, resp)
}

var DeleteIssue = func(w http.ResponseWriter, r *http.Request) {

	params := mux.Vars(r)
	issue_id, err := strconv.Atoi(params["issue_id"])
	user_id := int(r.Context().Value("user").(uint))
	
	fmt.Println(issue_id, user_id)
	if err != nil {
		fmt.Println(err)
		u.Respond(w, u.Message(false, "problem converting issue id specified at header"))
	}
	resp := models.DeleteIssues(issue_id)
	
	u.Respond(w, resp)
}

var UpdateIssue = func(w http.ResponseWriter, r *http.Request) {
	
	updated_issue := &models.Issue{}
	user_id := int(r.Context().Value("user").(uint))
	params := mux.Vars(r)
	issue_id, err := strconv.Atoi(params["issue_id"])
	
	if err != nil {
		fmt.Println(err)
		u.Respond(w, u.Message(false, "problem converting issue id specified at header"))
	}

	if err := json.NewDecoder(r.Body).Decode(updated_issue); err != nil {
		fmt.Println(err)
		u.Respond(w, u.Message(false, "Error while decoding request body"))
		return
	}

	
	fmt.Println(issue_id, user_id)
	resp := models.UpdateIssues(issue_id, updated_issue)
	
	u.Respond(w, resp)
}
