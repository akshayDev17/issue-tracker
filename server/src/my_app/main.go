package main

import (
	"fmt"
	"my_app/app"
	"my_app/controllers"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {

	router := mux.NewRouter()

	cors := handlers.CORS(
		handlers.AllowedHeaders([]string{"Authorization", "project_id"}),
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowCredentials(),
		handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"}),
	)
	router.Use(cors)

	// User Routes
	router.HandleFunc("/register", controllers.Register).Methods("POST")
	router.HandleFunc("/login", controllers.Login).Methods("POST", "OPTIONS")
	router.HandleFunc("/all_users", controllers.GetAllUsers).Methods("GET")
	// Project Routes
	router.HandleFunc("/project/new", controllers.CreateProject).Methods("POST")
	router.HandleFunc("/project/all", controllers.GetProjectsFor).Methods("GET")
	router.HandleFunc("/project/{id}/all_users", controllers.GetParticipants).Methods("GET")
	router.HandleFunc("/project/{project_id}/add/user/{user_id}", controllers.AddUserToProject).Methods("POST")
	router.HandleFunc("/project/{project_id}/delete/user/{user_id}", controllers.DeleteUserFromProject).Methods("DELETE")
	router.HandleFunc("/project/{id}/delete", controllers.DeleteProject).Methods("DELETE")
	router.HandleFunc("/project/{id}/update", controllers.UpdateProject).Methods("POST")
	//Issue Routes
	router.HandleFunc("/project/{project_id}/issue/new", controllers.CreateIssue).Methods("POST")
	router.HandleFunc("/project/{project_id}/issue/{issue_id}/assign_to_me", controllers.AssignIssueToMe).Methods("POST")
	router.HandleFunc("/project/{project_id}/issue/list", controllers.GetAllIssues).Methods("GET")
	router.HandleFunc("/project/{project_id}/issue/unassigned_list", controllers.UnassignedIssues).Methods("GET")
	router.HandleFunc("/project/{project_id}/issue/{issue_id}/delete", controllers.DeleteIssue).Methods("DELETE")
	router.HandleFunc("/project/{project_id}/issue/{issue_id}/update", controllers.UpdateIssue).Methods("POST")
	router.Use(app.JwtAuthentication) //attach JWT auth middleware

	//router.NotFoundHandler = app.NotFoundHandler

	port := os.Getenv("PORT")
	if port == "" {
		port = "12345" //localhost
	}

	fmt.Println(port)

	err := http.ListenAndServe(":"+port, router) //Launch the app, visit localhost:8000/api
	if err != nil {
		fmt.Print(err)
	}
}
