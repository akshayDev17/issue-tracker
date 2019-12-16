package models

import (
	"fmt"
	u "server/utils"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

type Project struct {
	gorm.Model
	Name      string `json:"projectName"`
	Desc      string `json:"projectDesc"`
	CreatedBy int    `json:"created_user_id"`
}

type UserProjectTable struct {
	ProjectID int `json:"projectID"`
	UserID    int `json:"userID"`
}

func (project *Project) Validate() (map[string]interface{}, bool) {

	//check for empty issue name
	if len(project.Name) == 0 {
		return u.Message(false, "Project name cannot be empty!"), false
	}

	// check for empty issue description
	if len(project.Desc) == 0 {
		return u.Message(false, "Project description cannot be empty!"), false
	}

	return u.Message(false, "Valid Issue created"), true
}

func (project *Project) Create(creator_id int) map[string]interface{} {
	// validate issue
	if resp, ok := project.Validate(); !ok {
		return resp
	}

	project.CreatedBy = creator_id

	// add the project to projects database
	GetDB().Table("project_db").Create(project)

	// add the project-creator pair to the
	// project-user table
	project_user_entry := &UserProjectTable{}
	temp_id := int(project.ID)
	project_user_entry.ProjectID, project_user_entry.UserID = temp_id, creator_id

	GetDB().Table("project_participants_db").Create(project_user_entry)

	response := u.Message(true, "Issue has been created")
	response["project"] = project
	return response
}

// given a user, fetch all projects related to it
func GetAllProjects(user_id int) []*Project {

	// get the project-id-list a user is involved in
	project_id_list_uint := make([]*UserProjectTable, 0)
	err := GetDB().Table("project_participants_db").Where("user_id = ?", user_id).Find(&project_id_list_uint).Error
	if err != nil {
		fmt.Println(err)
		return nil
	}
	// initialize the projects array
	projects := make([]*Project, 0)

	// fetch the project info for all projects that
	// were just extracted from project-participants table
	for _, project_id := range project_id_list_uint {
		curr_project := &Project{}
		err := GetDB().Table("project_db").Where("id = ?", project_id.ProjectID).First(curr_project).Error
		if err != nil {
			fmt.Println(err)
			return nil
		}
		projects = append(projects, curr_project)
	}
	return projects
}

// add user to a project, and add this pair to the DB
func AddUserProjectToDb(proj_id int, user_id int, sender_id int) map[string]interface{} {

	// extract project info for the project-id provided
	project := &Project{}
	err := GetDB().Table("project_db").Where("id = ?", proj_id).First(project).Error

	// check if a project exists with the given project-id
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// not found
			return u.Message(false, "Project not found")
		}
		return u.Message(false, "Connection error. Please retry")
	}

	// check if a user with given user-id exists
	user := &Account{}
	err = GetDB().Table("user_db").Where("id = ?", user_id).First(user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// not found
			return u.Message(false, "Invalid User requested")
		}
		return u.Message(false, "Connection error. Please retry")
	}

	// extract project-owner for the above provided project
	project_owner := project.CreatedBy
	if project_owner != sender_id {
		return u.Message(false, "Warning!! A non-owner has requested for addition of a user to a project")
	}

	// add the user as a member of the project
	user_project_entry := &UserProjectTable{
		ProjectID: proj_id,
		UserID:    user_id,
	}
	//user_project_entry.UserID, user_project_entry.ProjectID := user_id, proj_id
	GetDB().Table("project_participants_db").Create(user_project_entry)

	resp := u.Message(true, "Added User to project")
	resp["user_project"] = user_project_entry
	return resp
}
