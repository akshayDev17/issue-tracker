package models

import (
	"fmt"
	u "my_app/utils"
	"github.com/jinzhu/gorm"
)

type Issue struct {
	gorm.Model
	Name           string `json:"name"`
	Desc           string `json:"desc"`
	TaskType       int    `json:"task_type"`
	ProjectID      int    `json:"project_id"`
	CreatedBy      int
	AssignedUserId int `json:"assigned_to"`
}

func (issue *Issue) Validate() (map[string]interface{}, bool) {
	db := GetDB()
	//check for empty issue name
	if len(issue.Name) == 0 {
		return u.Message(false, "Issue name cannot be empty!"), false
	}

	// check for empty issue description
	if len(issue.Desc) == 0 {
		return u.Message(false, "Issue description cannot be empty!"), false
	}

	// check if issue created is for an existing project or not
	temp_project := &Project{}
	err := db.Table("projects").Where("id = ?", issue.ProjectID).First(temp_project).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return u.Message(false, "Project does not exist"), false
		}
		return u.Message(false, "Connection error. Please retry."), false
	}

	// get all participants of the above requested project
	users_list := make([]*UserProjectTable, 0)
	db.Table("project_participants").Where("project_id = ?", issue.ProjectID).Find(&users_list)

	// get above requested project owner id
	proj_owner_id, creator_id, assigned_to_uid := temp_project.CreatedBy, issue.CreatedBy, issue.AssignedUserId

	// if the owner requested assignment of an issue to a user
	if creator_id == proj_owner_id {
		for _, uid := range users_list {
			// if the user to whom the issue is assigned to
			// is a project participant
			if uid.UserID == assigned_to_uid {
				return u.Message(false, "Issue created passed Validation"), true
			}
		}

		// if the user to whom the issue is assigned to
		// is not a project participant
		return u.Message(false, "Owner assigned issue to a non-participant user"), false

	} else if creator_id == assigned_to_uid {
		// a user requested to be assigned an issue to
		for _, uid := range users_list {
			if uid.UserID == assigned_to_uid {
				// user is project participant
				return u.Message(false, "Issue created passed Validation"), true
			}
		}
		// user is not a project participant
		return u.Message(false, "A non-participant user requested an issue to be assigned"), false
	} else {
		// some user, neither the project owner nor a project participant
		// requested an issue assignment
		return u.Message(false, "Somebody other than the owner requested for issue creation"), false
	}
}

func (issue *Issue) Create() map[string]interface{} {
	
	db := GetDB()
	if resp, ok := issue.Validate(); !ok {
		return resp
	}

	// add the issue to database
	db.Create(&issue)

	response := u.Message(true, "Issue has been created")
	response["issue"] = issue
	return response
}

// given a task, fetch all issues related to it
func GetAllIssues(project_id int, requesting_uid int) []*Issue {
	// check if the requested project exists
	db := GetDB()
	projects := make([]*UserProjectTable, 0)
	
	if err := db.Table("project_participants").Where("project_id = ?", project_id).Find(&projects).Error; err != nil {
		return nil
	}

	init_flag := false
	// get project participants of the given project
	for _, participant_id := range projects {
		if participant_id.UserID == requesting_uid {
			init_flag = true
			break
		}
	}

	if !init_flag {
		return nil
	}

	issues := make([]*Issue, 0)
	
	if err := db.Table("issues").Where("project_id = ?", project_id).Find(&issues).Error; err != nil {
		fmt.Println(err)
		return nil
	}

	return issues
}

func DeleteIssues(issue_id int) map[string]interface{} {
	db := GetDB()
	issue := &Issue{}
	response := u.Message(false, "")
	
	if err := db.Table("issues").Where("id = ?", issue_id).First(&issue).Error; err != nil {
		response = u.Message(false, "Issue not found")
		return response
	}
	

	
	if err :=  db.Delete(&issue).Error;  err != nil {
		response = u.Message(false, "Issue cannot be deleted")
		return response
	}

	response = u.Message(true, "Issue has been deleted")
	return response
}

func UpdateIssues(issue_id int, updated_issue *Issue) map[string]interface{} {
	db := GetDB()
	issue := &Issue{}
	response := u.Message(false, "")
	
	if err := db.Table("issues").Where("id = ?", issue_id).First(&issue).Error; err != nil {
		response = u.Message(false, "Issue not found")
		return response
	}
	
	issue.Name = updated_issue.Name
	issue.Desc = updated_issue.Desc
	issue.TaskType = updated_issue.TaskType
	
	db.Save(&issue)
	response = u.Message(true, "Issue has been Updated")
	return response
}
