package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server/models"
	u "server/utils"
	"strconv"
)

var CreateIssue = func(w http.ResponseWriter, r *http.Request) {

	//Grab the id of the user that send the request
	// i.e. created the issue
	user1 := r.Context().Value("user").(uint)
	creator_id := int(user1)
	issue := &models.Issue{}

	// json data should have the id of user to whom the issue
	// is being assigned to and the projec to which the issue
	// belongs to, along with name, description and task-type
	err := json.NewDecoder(r.Body).Decode(issue)
	if err != nil {
		fmt.Println(err)
		u.Respond(w, u.Message(false, "Error while decoding request body"))
		return
	}
	issue.CreatedBy = creator_id
	resp := issue.Create()
	u.Respond(w, resp)
}

// get issues for a project assigned to a user
var GetIssuesFor = func(w http.ResponseWriter, r *http.Request) {

	pr_id := r.Header.Get("project_id")
	project_id, err := strconv.Atoi(pr_id)
	if err != nil {
		fmt.Println(err)
		u.Respond(w, u.Message(false, "problem converting project id specified at header"))
	}
	data := models.GetAllIssues(project_id)
	resp := u.Message(true, "success")
	resp["data"] = data
	u.Respond(w, resp)
}
