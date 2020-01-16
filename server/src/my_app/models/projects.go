package models

import (
	"fmt"
	u "my_app/utils"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

type Project struct {
	gorm.Model
	Name      string `json:"name"`
	Desc      string `json:"desc"`
	CreatedBy int    `json:"user_id"`
}

type UserProjectTable struct {
	ProjectID int `json:"projectID"`
	UserID    int `json:"userID"`
}

func (project *Project) Validate() (map[string]interface{}, bool) {

	//check for empty project name
	if len(project.Name) == 0 {
		return u.Message(false, "Project name cannot be empty!"), false
	}

	// check for empty issue description
	if len(project.Desc) == 0 {
		return u.Message(false, "Project description cannot be empty!"), false
	}

	return u.Message(false, "Valid Project created"), true
}

func (project *Project) Create(creator_id int) map[string]interface{} {
	db := GetDB()
	// validate project
	if resp, ok := project.Validate(); !ok {
		return resp
	}

	project.CreatedBy = creator_id

	// add the project to projects database
	db.Table("projects").Create(project)

	// add the project-creator pair to the
	// project-user table
	project_user_entry := &UserProjectTable{}
	temp_id := int(project.ID)
	project_user_entry.ProjectID, project_user_entry.UserID = temp_id, creator_id

	db.Table("project_participants").Create(project_user_entry)

	response := u.Message(true, "Project has been created")
	response["project"] = project
	return response
}

// given a user, fetch all projects related to it
func GetAllProjects(user_id int) []*Project {
	db := GetDB()
	// get the project-id-list a user is involved in
	project_id_list_uint := make([]*UserProjectTable, 0)
	err := db.Table("project_participants").Where("user_id = ?", user_id).Find(&project_id_list_uint).Error
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
		db.Table("projects").Where("id = ?", project_id.ProjectID).First(curr_project)
		projects = append(projects, curr_project)
	}
	return projects
}

// add user to a project, and add this pair to the DB
func AddUserProjectToDb(proj_id int, user_id int, sender_id int) map[string]interface{} {

	db := GetDB()
	// extract project info for the project-id provided
	project := &Project{}
	err := db.Table("projects").Where("id = ?", proj_id).First(project).Error

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
	err = db.Table("users").Where("id = ?", user_id).First(user).Error
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

	// check if the user is already a member of the project
	user_project_entry := &UserProjectTable{}
	err = db.Table("project_participants").Where("project_id = ?", proj_id).Where("user_id = ?", user_id).First(user_project_entry).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// add the user as a member of the project
			user_project_entry = &UserProjectTable{
				ProjectID: proj_id,
				UserID:    user_id,
			}
			//user_project_entry.UserID, user_project_entry.ProjectID := user_id, proj_id
			db.Table("project_participants").Create(user_project_entry)

			resp := u.Message(true, "Added User to project")
			resp["user_project"] = user_project_entry
			return resp
		}
		resp := u.Message(false, "Error in connecting to DB")
		return resp
	}
	resp := u.Message(false, "The given user is already a member of the project")
	return resp

}

// delete user from a project
func DeleteUserProjectFromDb(proj_id int, user_id int, sender_id int) map[string]interface{} {

	db := GetDB()
	// extract project info for the project-id provided
	project := &Project{}
	err := db.Table("projects").Where("id = ?", proj_id).First(project).Error

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
	err = db.Table("users").Where("id = ?", user_id).First(user).Error
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

	// check if the user is actually a member of the project
	err = db.Table("project_participants").Where("project_id = ?", proj_id).Where("user_id = ?", user_id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// not a member of the given project
			resp := u.Message(false, "The given user is not a participant")
			return resp
		}
		resp := u.Message(false, "DB connection occured, please retry in a while")
		return resp
	}
	err = db.Exec("delete from project_participants where project_id = ? and user_id = ?", proj_id, user_id).Error
	if err != nil {
		resp := u.Message(false, "Error in connecting to DB")
		return resp
	}
	resp := u.Message(true, "The given user was successfully deleted from the project")
	return resp

}

func GetProjectParticipants(project_id int) map[string]interface{} {
	// fetch the Database
	db = GetDB()
	// get list of users for this project
	participants := make([]*UserProjectTable, 0)
	err := db.Table("project_participants").Where("project_id = ?", project_id).Find(&participants).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return u.Message(false, "Invalid project ID given")
		}
		return u.Message(false, "Connection Error, please retry.")
	}
	participant_details := make([]*Account, 0)
	for _, participant := range participants {
		temp_user := &Account{}
		db.Table("users").Where("id = ?", participant.UserID).First(temp_user)
		temp_user.Password = ""
		participant_details = append(participant_details, temp_user)
	}
	resp := u.Message(true, "Obtained Participant details")
	resp["participants"] = participant_details
	return resp

}

func DeleteProjects(user_id int, project_id int) map[string]interface{} {
	// user_id is the ID of the user who has requested the deletion
	// of the project with ID=project_id
	db := GetDB()
	project := &Project{}

	if err := db.Table("projects").Where("id = ?", project_id).First(project).Error; err != nil {
		// if no project with the given project_id exists
		response := u.Message(false, "Project not found")
		return response
	}

	creator_id := project.CreatedBy
	if creator_id != user_id {
		// a non-owner has requested for project deletion
		response := u.Message(false, "A non-owner requested project deletion")
		return response
	}

	if err := db.Table("projects").Unscoped().Delete(project).Error; err != nil {
		response := u.Message(false, "Project cannot be deleted")
		return response
	}

	if err := db.Exec("delete from project_participants where project_id = ?", project_id).Error; err != nil {
		response := u.Message(false, "Project cannot be deleted")
		return response
	}

	response := u.Message(true, "Project has been deleted")
	return response
}

func UpdateProjects(project_id int, updated_project *Project) map[string]interface{} {

	db := GetDB()

	if resp, ok := updated_project.Validate(); !ok {
		return resp
	}

	project := &Project{}
	response := u.Message(false, "")

	if err := db.Table("projects").Where("id = ?", project_id).First(project).Error; err != nil {
		response = u.Message(false, "Project not found")
		return response
	}

	project.Name = updated_project.Name
	project.Desc = updated_project.Desc

	db.Save(project)
	response = u.Message(true, "Project has been Updated")
	return response
}
